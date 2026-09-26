import { CartItemsRepository } from '@/database/repositories/cart-items-repository';
import { CartsRepository } from '@/database/repositories/carts-repository';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ListCartProductsService {
  constructor(
    private cartsRepository: CartsRepository,
    private cartItemsRepository: CartItemsRepository,
  ) {}

  async execute(userId: string, cartId: string) {
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    const isCartExists = await this.cartsRepository.findByIdAndUserId(
      cartId,
      userId,
    );

    if (!isCartExists) {
      throw new NotFoundException('Resource Not Found');
    }

    return await this.cartItemsRepository.findAllItemsByCart(cartId);
  }
}
