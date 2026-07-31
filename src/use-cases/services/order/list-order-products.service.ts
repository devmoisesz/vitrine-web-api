import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { OrdersRepository } from '@/database/repositories/orders-repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ListOrderProductsService {
  constructor(
    private ordersRepository: OrdersRepository,
    private collaboratorRepository: CollaboratorsRepository,
  ) {}

  async execute(orderId: string, page: number, userId: string) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Resource Not Found');
    }

    const isOrderOwner = order.userId === userId;

    const isStoreCollaborator =
      !isOrderOwner && await this.collaboratorRepository.findByUserAndStore(
        userId,
        order.storeId,
      );

    if (!isOrderOwner && !isStoreCollaborator) {
      throw new NotFoundException('Resource Not Found');
    }

    return await this.ordersRepository.findOrderDetails(order.id, page);
  }
}
