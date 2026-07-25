import { Order } from '@prisma/client';
import { CreateOrder, OrdersRepository } from '@/database/repositories/orders-repository';
import { Decimal } from '@prisma/client/runtime/wasm-compiler-edge';

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

  async findById(id: string): Promise<Order | null> {
    const order = this.items.find((item) => item.id === id)

    if(!order) return null

    return order
  }

  async findManyByUserId(userId: string, page: number): Promise<Order[]> {
    const pageSize = 5;

    return this.items
      .filter((order) => order.userId === userId)
      .slice((page - 1) * pageSize, page * pageSize);
  }

  async findManyByStoreId(storeId: string, page: number): Promise<Order[]> {
    const pageSize = 10;

    return this.items
      .filter((order) => order.storeId === storeId)
      .slice((page - 1) * pageSize, page * pageSize);
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
    const paginatedItems = (order.order_items || []).slice(startIndex, endIndex);

    const formattedItems = paginatedItems.map((item) => {
      const formattedProduct = item.product ? {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        products_images: (item.product.products_images || [])
          .filter((img: any) => img.is_main === true)
          .map((img: any) => ({ image_url: img.image_url }))
      } : null; 

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