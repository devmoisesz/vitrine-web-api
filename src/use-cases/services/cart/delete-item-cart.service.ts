import { CartItemsRepository } from '@/database/repositories/cart-items-repository';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class DeleteItemCartService {
  constructor(private cartItemsRepository: CartItemsRepository) {}

  async execute(userId: string, cartItemId: string) {
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    const isItemExists = await this.cartItemsRepository.findByIdAndUserId(
      cartItemId,
      userId,
    );

    if (!isItemExists) {
      throw new NotFoundException('Resource Not Found');
    }

    await this.cartItemsRepository.delete(cartItemId);
  }
}
