import { Order } from '@prisma/client';
import {
  CreateOrder,
  OrdersRepository,
} from '@/database/repositories/orders-repository';
import { Decimal } from '@prisma/client/runtime/wasm-compiler-edge';
import { CartsInMemoryRepository } from './cart-in-memory-repository';
import { CartItemsInMemoryRepository } from './cart-items-in-memory-repository';

export interface InMemoryOrder extends Order {
  order_items?: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: Decimal;
    selectedSize: string | null;
    product?: any;
  }>;
}

export class OrdersInMemoryRepository implements OrdersRepository {
  public items: InMemoryOrder[] = [];
  private checkingOut = new Set<string>();

  constructor(
    private carts?: CartsInMemoryRepository,
    private cartItems?: CartItemsInMemoryRepository,
  ) {}

  async createFromCart(cartId: string, data: CreateOrder): Promise<Order | null> {
    const cart = this.carts?.items.find((item) =>
      item.id === cartId && item.userId === data.userId && item.storeId === data.storeId,
    );
    if (!cart || this.checkingOut.has(cartId)) return null;

    this.checkingOut.add(cartId);
    try {
      const order = await this.create(data);
      this.carts!.items = this.carts!.items.filter((item) => item.id !== cartId);
      if (this.cartItems) {
        this.cartItems.items = this.cartItems.items.filter((item) => item.cartId !== cartId);
      }
      return order;
    } finally {
      this.checkingOut.delete(cartId);
    }
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.items.find((item) => item.id === id);

    if (!order) return null;

    return order;
  }

  async findManyByUserId(
    userId: string,
    page: number,
  ): Promise<{ orders: Order[]; total: number }> {
    const pageSize = 5;

    const orders = this.items
      .filter((order) => order.userId === userId)
      .slice((page - 1) * pageSize, page * pageSize);

    const total = orders.length;

    return { orders, total };
  }

  async findManyByStoreId(storeId: string, page: number): Promise<{orders: Order[], total: number}> {
    const pageSize = 10;

    const orders = this.items
      .filter((order) => order.storeId === storeId)
      .slice((page - 1) * pageSize, page * pageSize);

    const total = orders.length;

    return { orders, total };
  }

  async create(data: CreateOrder): Promise<Order> {
    const orderId = crypto.randomUUID();

    const orderItems = data.items.map((item) => ({
      id: crypto.randomUUID(),
      orderId: orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: new Decimal(item.price.toString()),
      selectedSize: item.selectedSize,
    }));

    const newOrder: InMemoryOrder = {
      id: orderId,
      storeId: data.storeId,
      userId: data.userId,
      total: new Decimal(data.total.toString()),
      createdAt: new Date(),
      order_items: orderItems,
    };

    this.items.push(newOrder);

    return newOrder;
  }

  async findOrderDetails(id: string, page: number) {
    const pageSize = 10;

    const order = this.items.find((item) => item.id === id);

    if (!order) {
      return null;
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = (order.order_items || []).slice(
      startIndex,
      endIndex,
    );

    const formattedItems = paginatedItems.map((item) => {
      const formattedProduct = item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            products_images: (item.product.products_images || [])
              .filter((img: any) => img.is_main === true)
              .map((img: any) => ({ image_url: img.image_url })),
          }
        : null;

      return {
        ...item,
        product: formattedProduct,
      };
    });

    return {
      ...order,
      order_items: formattedItems,
    };
  }
}
