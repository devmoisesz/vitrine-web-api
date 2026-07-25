import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateOrder,
  OrdersRepository,
} from '@/database/repositories/orders-repository';
import { Order } from '@prisma/client';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByUserId(userId: string, page: number): Promise<Order[]> {
    const pageSize = 5

    return await this.prisma.order.findMany({
        where: {
            userId
        },
        take: pageSize,
        skip: (page - 1) * pageSize
    })
  }

  async create(data: CreateOrder): Promise<Order> {
    return await this.prisma.order.create({
      data: {
        storeId: data.storeId,
        userId: data.userId,
        total: data.total,
        order_items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            selectedSize: item.selectedSize,
          })),
        },
      },
    });
  }
}
