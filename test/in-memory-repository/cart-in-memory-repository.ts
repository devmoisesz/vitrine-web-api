import { Cart, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { CartsRepository } from '@/database/repositories/carts-repository';
import { StoresInMemoryRepository } from './stores-in-memory-repository';
import { CartItemsInMemoryRepository } from './cart-items-in-memory-repository';
import { ProductsInMemoryRepository } from './product-in-memory-repository';

export class CartsInMemoryRepository implements CartsRepository {
  public items: Cart[] = [];

  constructor(
    private storesRepository?: StoresInMemoryRepository,
    private cartItemsRepository?: CartItemsInMemoryRepository,
    private productsRepository?: ProductsInMemoryRepository,
  ) {}

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

  async findMany(userId: string, page: number): Promise<any[]> {
    const pageSize = 5;

    let userCarts = this.items.filter((item) => item.userId === userId);

    if (this.storesRepository) {
      userCarts = userCarts.filter((cart) => {
        const store = this.storesRepository?.items.find(
          (s) => s.id === cart.storeId,
        );
        return store && store.status === 'ATIVA';
      });
    }

    userCarts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const paginatedCarts = userCarts.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    return paginatedCarts.map((cart) => {
      const store = this.storesRepository?.items.find(
        (s) => s.id === cart.storeId,
      );

      const cartItems = this.cartItemsRepository?.items
        .filter((item) => item.cartId === cart.id)
        .map((item) => {
          const product = this.productsRepository?.items.find(
            (p) => p.id === item.productId,
          );

          return {
            ...item,
            product,
          };
        });

      return {
        ...cart,
        store: store
          ? {
              id: store.id,
              name: store.name,
              logo_image_url: store.logo_image_url,
              whatsapp: store.whatsapp,
            }
          : null,
        cart_items: cartItems ?? [],
      };
    });
  }
}
