import { CartItemsRepository } from '@/database/repositories/cart-items-repository';
import {
    Injectable,
    NotFoundException
} from '@nestjs/common';

@Injectable()
export class DeleteItemCartService {
  constructor(
    private cartItemsRepository: CartItemsRepository,
  ) {}

  async execute(cartItemId: string) {
    const isItemExists = await this.cartItemsRepository.findById(cartItemId)

    if(!isItemExists){
        throw new NotFoundException('Resource Not Found')
    }

    await this.cartItemsRepository.delete(cartItemId)
  }
}
