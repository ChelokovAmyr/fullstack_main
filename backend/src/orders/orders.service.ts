import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';
import { OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productsService.findOne(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        const quantity = parseInt(item.quantity);
        const price = parseFloat(item.price);

        if (product.stock < quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        total += price * quantity;

        const orderItem = this.orderItemsRepository.create({
          productId: item.productId,
          productName: item.productName,
          quantity,
          price,
        });

        orderItems.push(orderItem);

        // Update product stock
        await this.productsService.update(item.productId, {
          stock: product.stock - quantity,
        });
      }

      const shippingCost = 0; // Can be calculated based on address
      const tax = total * 0.1; // 10% tax

      const order = this.ordersRepository.create({
        userId,
        items: orderItems,
        total: total + shippingCost + tax,
        shippingCost,
        tax,
        shippingAddress: createOrderDto.shippingAddress,
        shippingCity: createOrderDto.shippingCity,
        shippingPostalCode: createOrderDto.shippingPostalCode,
        shippingPhone: createOrderDto.shippingPhone,
        notes: createOrderDto.notes,
        status: createOrderDto.status || OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(userId?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    return this.ordersRepository.find({
      where,
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.ordersRepository.update(id, updateOrderDto);
  }

  remove(id: string) {
    return this.ordersRepository.delete(id);
  }
}

