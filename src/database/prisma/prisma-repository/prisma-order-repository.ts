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

  async findManyByStoreId(
    storeId: string,
    page: number,
  ): Promise<{ orders: Order[]; total: number }> {
    const pageSize = 10;

    const where: Prisma.OrderWhereInput = {
      storeId,
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total }
  }

  async create(data: CreateOrder): Promise<Order> {
    return this.createOrder(this.prisma, data);
  }

  async createFromCart(cartId: string, data: CreateOrder): Promise<Order | null> {
    return this.prisma.$transaction(async (tx) => {
      // Deleting claims this cart across all application instances. Concurrent
      // checkouts wait for this transaction and cannot consume the same cart.
      // Cascaded item deletion is also rolled back if order creation fails.
      const consumed = await tx.cart.deleteMany({
        where: { id: cartId, userId: data.userId, storeId: data.storeId },
      });

      if (consumed.count !== 1) return null;

      return this.createOrder(tx, data);
    });
  }

  private createOrder(tx: Prisma.TransactionClient, data: CreateOrder): Promise<Order> {
    return tx.order.create({
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
