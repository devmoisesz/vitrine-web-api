import { Order } from '@prisma/client';
import { CreateOrder, OrdersRepository } from '@/database/repositories/orders-repository';
import { Decimal } from '@prisma/client/runtime/wasm-compiler-edge';

// Interface opcional para estender o Order com os itens salvos em memória
export interface InMemoryOrder extends Order {
  order_items?: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: Decimal;
    selectedSize: string | null;
  }>;
}

export class OrdersInMemoryRepository implements OrdersRepository {
  public items: InMemoryOrder[] = [];

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
}