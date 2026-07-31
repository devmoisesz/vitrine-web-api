import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateOrder,
  OrdersRepository,
} from '@/database/repositories/orders-repository';
import { Order, Prisma } from '@prisma/client';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) return null;

    return order;
  }

  async findOrderDetails(id: string, page: number) {
    const pageSize = 10;

    return this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        order_items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                products_images: {
                  where: {
                    is_main: true,
                  },
                  select: {
                    image_url: true,
                  },
                },
              },
            },
          },
          take: pageSize,
          skip: (page - 1) * pageSize,
        },
      },
    });
  }

  async findManyByUserId(
    userId: string,
    page: number,
  ): Promise<{ orders: Order[]; total: number }> {
    const pageSize = 5;

    const where: Prisma.OrderWhereInput = {
      userId,
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async findManyByStoreId(storeId: string, page: number): Promise<Order[]> {
    const pageSize = 10;

    return await this.prisma.order.findMany({
      where: {
        storeId,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
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
            quantity: item.quantity,
            price: item.price,
            selectedSize: item.selectedSize,
          })),
        },
      },
    });
  }
}
