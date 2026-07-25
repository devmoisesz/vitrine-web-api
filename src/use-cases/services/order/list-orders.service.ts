import { OrdersRepository } from '@/database/repositories/orders-repository';
import {
    Injectable
} from '@nestjs/common';
import { Order } from '@prisma/client';

@Injectable()
export class ListOrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
  ) {}

  async execute(
    userId: string,
    page: number
  ): Promise<Order[]> {
   return await this.ordersRepository.findManyByUserId(userId, page)
  }
}
