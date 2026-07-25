import { CartItemsRepository } from '@/database/repositories/cart-items-repository';
import { CartsRepository } from '@/database/repositories/carts-repository';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AddProductToCartService {
  constructor(
    private productsRepository: ProductsRepository,
    private storesRepository: StoresRepository,
    private cartsRepository: CartsRepository,
    private cartItems: CartItemsRepository,
  ) {}

  async execute(
    userId: string,
    productId: string,
    quantity: number,
    size?: string,
  ): Promise<void> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }

    const store = await this.storesRepository.findById(product.storeId)

    if(store?.status === 'INATIVA'){
      throw new ConflictException('Unable to process the request');
    }

    if (product.status === 'INATIVO') {
      throw new ConflictException('Unable to process the request');
    }

    if (product.stock <= 0) {
      throw new ConflictException('Produto sem estoque disponível.');
    }
    if (product.sizes.length > 0) {
      if (!size) {
        throw new BadRequestException('É necessário selecionar um tamanho.');
      }
      if (!product.sizes.includes(size)) {
        throw new BadRequestException('Tamanho selecionado é inválido.');
      }

      const hasStoreCart = await this.cartsRepository.findByUserIdAndStoreId(
        userId,
        product.storeId,
      );

      if (hasStoreCart) {
        const items = await this.cartItems.findByCartId(hasStoreCart.id);

        const existingItem = items.find(
          (item) => item.productId === productId && item.selectedSize == size,
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;

          if (newQuantity > product.stock) {
            throw new ConflictException(
              'Quantidade excede o estoque disponível.',
            );
          }

          await this.cartItems.save({
            id: existingItem.id,
            cartId: hasStoreCart.id,
            productId: productId,
            quantity: (existingItem.quantity += quantity),
            selectedSize: size,
          });
        } else {
          if (quantity > product.stock) {
            throw new ConflictException(
              'Quantidade excede o estoque disponível.',
            );
          }

          await this.cartItems.create({
            cartId: hasStoreCart.id,
            productId: productId,
            quantity,
            selectedSize: size,
          });
        }

        return;
      }

      if (quantity > product.stock) {
        throw new ConflictException('Quantidade excede o estoque disponível.');
      }

      const cart = await this.cartsRepository.create({
        userId,
        storeId: product.storeId,
      });

      await this.cartItems.create({
        cartId: cart.id,
        productId,
        quantity,
        selectedSize: size,
      });
    }
  }
}
