import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CartItems, Prisma } from '@prisma/client';
import { CartItemsRepository } from '@/database/repositories/cart-items-repository';

@Injectable()
export class PrismaCartItemsRepository implements CartItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CartItemsUncheckedCreateInput): Promise<void> {
    await this.prisma.cartItems.create({
      data: {
        cartId: data.cartId,
        productId: data.productId,
        quantity: data.quantity,
        selectedSize: data.selectedSize,
      },
    });
  }

  async save(data: Prisma.CartItemsUncheckedCreateInput): Promise<void> {
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
  }

  async findByCartId(cartId: string): Promise<CartItems[]> {
    return await this.prisma.cartItems.findMany({
      where: {
        cartId,
      },
    });
  }
}
