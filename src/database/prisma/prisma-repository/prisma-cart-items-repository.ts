import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CartItems, Prisma } from '@prisma/client';
import {
  CartItemsRepository,
  SaveCartItemInput,
} from '@/database/repositories/cart-items-repository';

@Injectable()
export class PrismaCartItemsRepository implements CartItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async delete(id: string): Promise<void> {
    await this.prisma.cartItems.delete({
      where: {
        id,
      },
    });
  }

  async findByCartProductAndSize(
    cartId: string,
    productId: string,
    selectedSize?: string,
  ): Promise<CartItems | null> {
    const cartItems = await this.prisma.cartItems.findFirst({
      where: {
        cartId,
        productId,
        selectedSize,
      },
    });

    if (!cartItems) return null;

    return cartItems;
  }

  async findById(id: string): Promise<CartItems | null> {
    const cartItems = await this.prisma.cartItems.findUnique({
      where: {
        id,
      },
    });

    if (!cartItems) return null;

    return cartItems;
  }

  async create(data: Prisma.CartItemsUncheckedCreateInput): Promise<CartItems> {
    return await this.prisma.cartItems.create({
      data: {
        cartId: data.cartId,
        productId: data.productId,
        quantity: data.quantity,
        selectedSize: data.selectedSize,
      },
    });
  }

  async save(data: SaveCartItemInput): Promise<void> {
    if ('id' in data && data.id) {
      await this.prisma.cartItems.update({
        where: {
          id: data.id,
        },
        data: {
          cartId: data.cartId,
          productId: data.productId,
          quantity: data.quantity,
          selectedSize: data.selectedSize,
        },
      });
    } else {
      await this.prisma.cartItems.create({
        data: data as Prisma.CartItemsUncheckedCreateInput,
      });
    }
  }

  async findByCartId(cartId: string): Promise<CartItems[]> {
    return await this.prisma.cartItems.findMany({
      where: {
        cartId,
      },
    });
  }

  async findAllItemsByCart(cartId: string): Promise<CartItems[]> {
    return await this.prisma.cartItems.findMany({
      where: {
        cartId,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            products_images: {
              select: {
                image_url: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
            subcategory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
