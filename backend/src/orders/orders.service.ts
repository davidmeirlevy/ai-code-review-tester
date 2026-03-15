import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

// INTENTIONAL ISSUE #4: No transaction handling.
// The createOrder method performs multiple writes (create order, update stock, etc.)
// without wrapping them in a database transaction. If the process fails mid-way
// (e.g., after deducting stock but before saving the order), the database will be
// left in an inconsistent state. This should use queryRunner.startTransaction().

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { items, shippingAddress, notes } = createOrderDto;

    // Validate all products exist and have sufficient stock
    // INTENTIONAL ISSUE: No transaction — if this fails after partial writes, data is inconsistent
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId, isActive: true },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}. Available: ${product.stock}`,
        );
      }

      const orderItem = this.orderItemRepository.create({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity,
        productSnapshot: JSON.stringify({
          name: product.name,
          sku: product.sku,
          price: product.price,
        }),
      });

      orderItems.push(orderItem);
      subtotal += product.price * item.quantity;

      // Deduct stock — no transaction means if order save fails, stock is already deducted
      product.stock -= item.quantity;
      await this.productRepository.save(product);
    }

    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
    const total = subtotal + tax + shippingCost;

    // INTENTIONAL ISSUE: Race condition potential.
    // Between checking stock above and saving the order, another request
    // could also read the same stock level and both orders could proceed
    // even though there's only enough stock for one. Proper fix: pessimistic
    // locking or atomic decrement with a check constraint.
    const order = this.orderRepository.create({
      orderNumber: `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddress,
      notes,
    });

    return this.orderRepository.save(order);
  }

  // INTENTIONAL ISSUE #4 (N+1 pattern in orders):
  // This method fetches orders, then for each order fetches each item's product separately.
  // With 20 orders each having 3 items, this results in 1 + 20 + 60 = 81 queries
  // instead of using a proper JOIN or eager loading.
  async getOrdersByUser(userId: string): Promise<any[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // N+1 query pattern: fetching items for each order separately
    const ordersWithDetails = [];
    for (const order of orders) {
      const orderItems = await this.orderItemRepository.find({
        where: { orderId: order.id },
      });

      // Another N+1: fetching product details for each item
      const itemsWithProducts = [];
      for (const item of orderItems) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        itemsWithProducts.push({ ...item, product });
      }

      ordersWithDetails.push({ ...order, items: itemsWithProducts });
    }

    return ordersWithDetails;
  }

  async getOrderById(id: string, userId?: string): Promise<Order> {
    const whereCondition: any = { id };
    if (userId) {
      whereCondition.userId = userId;
    }

    const order = await this.orderRepository.findOne({
      where: whereCondition,
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.getOrderById(id);
    order.status = status;
    return this.orderRepository.save(order);
  }

  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    revenue: number;
  }> {
    const total = await this.orderRepository.count();
    const pending = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
    });
    const processing = await this.orderRepository.count({
      where: { status: OrderStatus.PROCESSING },
    });

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'revenue')
      .where('order.paymentStatus = :status', { status: 'paid' })
      .getRawOne();

    return {
      total,
      pending,
      processing,
      revenue: parseFloat(revenueResult?.revenue || '0'),
    };
  }
}
