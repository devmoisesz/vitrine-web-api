import { OrdersRepository } from '@/database/repositories/orders-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '@prisma/client';

@Injectable()
export class ListStoreOrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(slug: string, page: number): Promise<{orders: Order[], total: number}> {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Resource Not 6 Found');
    }

    return await this.ordersRepository.findManyByStoreId(store.id, page);
  }
}
