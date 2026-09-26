import { CartItemsRepository } from '@/database/repositories/cart-items-repository';
import { CartsRepository } from '@/database/repositories/carts-repository';
import {
  CreateOrderItemInput,
  OrdersRepository,
} from '@/database/repositories/orders-repository';
import { ProductsRepository } from '@/database/repositories/products-repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class RegisterOrderService {
  constructor(
    private odersRepository: OrdersRepository,
    private cartsRepository: CartsRepository,
    private cartItemsRepository: CartItemsRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute(userId: string, cartId: string) {
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    const cart = await this.cartsRepository.findByIdAndUserId(cartId, userId);

    if (!cart) {
      throw new NotFoundException('Resource Not Found');
    }

    const items = await this.cartItemsRepository.findAllItemsByCart(cart.id);

    if (!items || items.length === 0) {
      throw new BadRequestException('Unable to process the request.');
    }

    let total = 0;
    const orderItems: CreateOrderItemInput[] = [];

    for (const item of items) {
      const product = await this.productsRepository.findById(item.productId);

      if (!product || product.status === 'INATIVO') {
        throw new ConflictException('Unable to process the request.');
      }

      if (item.quantity > product.stock) {
        throw new ConflictException('Unable to process the request.');
      }

      const itemPrice = Number(product?.price);
      total += itemPrice * item.quantity;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        selectedSize: item.selectedSize,
      });
    }

    await this.odersRepository.create({
      storeId: cart.storeId,
      userId,
      total,
      items: orderItems,
    });
  }
}
