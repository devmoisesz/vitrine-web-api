import { OrdersRepository } from '@/database/repositories/orders-repository';
import {
    Injectable,
    NotFoundException
} from '@nestjs/common';

@Injectable()
export class ListOrderProductsService {
  constructor(
    private ordersRepository: OrdersRepository,
  ) {}

  async execute(
    orderId: string,
    page: number
  ){
    const order = await this.ordersRepository.findById(orderId)

    if(!order){
        throw new NotFoundException('Resource Not Found')
    }

   return await this.ordersRepository.findOrderDetails(order.id, page)
  }
}
