import { Cart, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { CartsRepository } from '@/database/repositories/carts-repository';

export class CartsInMemoryRepository implements CartsRepository {
  public items: Cart[] = [];

  async create(data: Prisma.CartUncheckedCreateInput): Promise<Cart> {
    const cart = {
      id: randomUUID(),
      userId: data.userId,
      storeId: data.storeId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(cart);

    return cart;
  }

  async findByUserIdAndStoreId(
    userId: string,
    storeId: string,
  ): Promise<Cart | null> {
    const cart = this.items.find(
      (item) => item.userId === userId && item.storeId === storeId,
    );

    if (!cart) return null;

    return cart;
  }
}
