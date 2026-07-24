import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Cart, Prisma } from '@prisma/client';
import { CartsRepository } from '@/database/repositories/carts-repository';

@Injectable()
export class PrismaCartsRepository implements CartsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(userId: string, page: number): Promise<Cart[]> {
    const pageSize = 5;

    return await this.prisma.cart.findMany({
      where: {
        userId,
        store: {
          status: 'ATIVA',
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo_image_url: true,
            whatsapp: true,
          },
        },
        cart_items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                products_images: {
                  where: {
                    is_main: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async create(data: Prisma.CartUncheckedCreateInput): Promise<Cart> {
    return await this.prisma.cart.create({
      data: {
        userId: data.userId,
        storeId: data.storeId,
      },
    });
  }

  async findByUserIdAndStoreId(
    userId: string,
    storeId: string,
  ): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!cart) {
      return null;
    }

    return cart;
  }
}
