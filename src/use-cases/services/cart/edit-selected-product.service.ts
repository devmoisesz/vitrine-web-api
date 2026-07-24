import { CartItemsRepository } from '@/database/repositories/cart-items-repository';
import { ProductsRepository } from '@/database/repositories/products-repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class EditSelectedProductService {
  constructor(
    private cartItemsRepository: CartItemsRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute(cartItemId: string, quantity?: number, newSize?: string) {
    const currentItem = await this.cartItemsRepository.findById(cartItemId);

    if (!currentItem) {
      throw new NotFoundException('Resource Not Found');
    }

    const product = await this.productsRepository.findById(
      currentItem.productId,
    );

    if (!product || product.status === 'INATIVO') {
      throw new NotFoundException('Resorce Not Found.');
    }

    const finalQuantity = quantity ?? currentItem.quantity;
    const finalSize =
      newSize !== undefined ? newSize : currentItem.selectedSize;

    if (product.sizes.length > 0) {
      if (!newSize || !product.sizes.includes(newSize)) {
        throw new BadRequestException('Tamanho inválido.');
      }
    }

    const isSizeChanged = currentItem.selectedSize !== finalSize;
    
    if (isSizeChanged) {
      const existingItemWithNewSize =
        await this.cartItemsRepository.findByCartProductAndSize(
          currentItem.cartId,
          currentItem.productId,
          newSize,
        );

      if (existingItemWithNewSize) {
        const combinedQuantity =
          existingItemWithNewSize.quantity + finalQuantity;

        if (combinedQuantity > product.stock) {
          console.log('1')
          throw new ConflictException(
            'Unable to process the request.',
          );
        }

        await this.cartItemsRepository.save({
          id: existingItemWithNewSize.id,
          quantity: combinedQuantity,
        });

        await this.cartItemsRepository.delete(currentItem.id);
        return
      }
    }

    if(finalQuantity > product.stock){
      throw new ConflictException('Unable to process the request.')
    }

    await this.cartItemsRepository.save({
      id: currentItem.id,
      quantity: finalQuantity,
      selectedSize: finalSize ?? null,
    });
  }
}
