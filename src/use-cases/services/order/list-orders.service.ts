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
  ): Promise<{orders: Order[], total: number}> {
   return await this.ordersRepository.findManyByUserId(userId, page)
  }
}
