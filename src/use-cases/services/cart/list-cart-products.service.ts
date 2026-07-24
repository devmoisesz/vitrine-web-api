import { CartItemsRepository } from '@/database/repositories/cart-items-repository';
import { CartsRepository } from '@/database/repositories/carts-repository';
import {
    Injectable,
    NotFoundException
} from '@nestjs/common';

@Injectable()
export class ListCartProductsService {
  constructor(
    private cartsRepository: CartsRepository,
    private cartItemsRepository: CartItemsRepository
  ) {}

  async execute(
    cartId: string
  ) {
   const isCartExists = await this.cartsRepository.findById(cartId)

   if(!isCartExists){
    throw new NotFoundException('Resource Not Found')
   }

   return await this.cartItemsRepository.findAllItemsByCart(cartId)
  }
}
