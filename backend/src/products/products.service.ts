import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';
import { Product, ProductCategory } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(
    page = 1,
    limit = 20,
    filters: ProductFilters = {},
  ): Promise<PaginatedProducts> {
    const skip = (page - 1) * limit;
    const { search, category, minPrice, maxPrice, inStock } = filters;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (inStock) {
      queryBuilder.andWhere('product.stock > 0');
    }

    queryBuilder.orderBy('product.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    return this.productRepository.find({
      where: { category, isActive: true },
      order: { rating: 'DESC' },
      take: 50,
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    // Soft delete by setting isActive to false
    product.isActive = false;
    await this.productRepository.save(product);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock += quantity;
    if (product.stock < 0) {
      product.stock = 0;
    }
    return this.productRepository.save(product);
  }

  async getProductStats(): Promise<{
    total: number;
    inStock: number;
    outOfStock: number;
    byCategory: Record<string, number>;
  }> {
    const total = await this.productRepository.count({ where: { isActive: true } });
    const inStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = true AND product.stock > 0')
      .getCount();

    const outOfStock = total - inStock;

    const categoryStats = await this.productRepository
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('product.isActive = true')
      .groupBy('product.category')
      .getRawMany();

    const byCategory = categoryStats.reduce((acc, row) => {
      acc[row.category] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    return { total, inStock, outOfStock, byCategory };
  }
}
