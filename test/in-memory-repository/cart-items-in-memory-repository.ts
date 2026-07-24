import { CartItems, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { CartItemsRepository } from '@/database/repositories/cart-items-repository';

export class CartItemsInMemoryRepository implements CartItemsRepository {
  public items: CartItems[] = [];

  async create(data: Prisma.CartItemsUncheckedCreateInput): Promise<void> {
    const cartItems = {
      id: randomUUID(),
      cartId: data.cartId,
      productId: data.productId,
      quantity: data.quantity,
      selectedSize: data.selectedSize ?? null,
    };

    this.items.push(cartItems);
  }

  async save(data: Prisma.CartItemsUncheckedCreateInput): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === data.id);

    if (itemIndex >= 0) {
      this.items[itemIndex] = {
        ...this.items[itemIndex],
        quantity: data.quantity ?? this.items[itemIndex].quantity,
        selectedSize:
          data.selectedSize !== undefined
            ? data.selectedSize
            : this.items[itemIndex].selectedSize,
      };
    } else {
      const newItem: CartItems = {
        id: data.id ?? randomUUID(),
        cartId: data.cartId,
        productId: data.productId,
        quantity: data.quantity,
        selectedSize: data.selectedSize ?? null,
      };

      this.items.push(newItem);
    }
  }

  async findByCartId(cartId: string): Promise<CartItems[]> {
    return this.items.filter((item) => item.cartId == cartId);
  }
}
