import { Order } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  price: Decimal | number;
  selectedSize: string | null;
}

export interface CreateOrder {
  storeId: string;
  userId: string;
  total: Decimal | number;
  items: CreateOrderItemInput[];
}

export abstract class OrdersRepository {
  abstract create(data: CreateOrder): Promise<Order>;
  abstract findManyByUserId(userId: string, page: number): Promise<Order[]>
  abstract findManyByStoreId(storeId: string, page: number): Promise<Order[]>
  abstract findById(id: string): Promise<Order | null>
  abstract findOrderDetails(orderId: string, page: number)
}
