/**
 * Database seeder — run with: npx ts-node src/database/seed.ts
 * Creates sample users, products, and orders for development.
 */

import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Product, ProductCategory } from '../products/entities/product.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'ai_code_review_db',
  entities: [User, Product],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connection established');

  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);

  // Create admin user
  const admin = userRepo.create({
    email: 'admin@shopdash.com',
    password: 'adminpassword123', // Plain text — seeder only, not production code
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isActive: true,
  });
  await userRepo.save(admin);

  // Create sample products
  const sampleProducts = [
    {
      name: 'Wireless Noise-Cancelling Headphones',
      description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and exceptional sound quality.',
      price: 299.99,
      stock: 45,
      category: ProductCategory.ELECTRONICS,
      sku: 'ELEC-WH-001',
      rating: 4.7,
      reviewCount: 1284,
    },
    {
      name: 'Organic Cotton T-Shirt',
      description: 'Soft, sustainable organic cotton t-shirt. Available in multiple colors. GOTS certified.',
      price: 34.99,
      stock: 200,
      category: ProductCategory.CLOTHING,
      sku: 'CLO-TS-001',
      rating: 4.3,
      reviewCount: 567,
    },
    {
      name: 'JavaScript: The Definitive Guide',
      description: 'The comprehensive reference guide to JavaScript, covering ES2023 and modern web APIs.',
      price: 49.99,
      stock: 73,
      category: ProductCategory.BOOKS,
      sku: 'BOOK-JS-001',
      rating: 4.8,
      reviewCount: 2103,
    },
    {
      name: 'Standing Desk Converter',
      description: 'Adjustable standing desk converter. Fits most standard desks. Height adjustable from 4.7" to 19.7".',
      price: 189.99,
      stock: 28,
      category: ProductCategory.HOME,
      sku: 'HOME-SD-001',
      rating: 4.5,
      reviewCount: 389,
    },
    {
      name: 'Yoga Mat Premium',
      description: 'Eco-friendly non-slip yoga mat. 6mm thickness for joint support. Includes carry strap.',
      price: 79.99,
      stock: 0,
      category: ProductCategory.SPORTS,
      sku: 'SPORT-YM-001',
      rating: 4.6,
      reviewCount: 812,
    },
  ];

  for (const p of sampleProducts) {
    const product = productRepo.create(p);
    await productRepo.save(product);
  }

  console.log(`Seeded ${sampleProducts.length} products`);
  await AppDataSource.destroy();
  console.log('Seeding complete');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
