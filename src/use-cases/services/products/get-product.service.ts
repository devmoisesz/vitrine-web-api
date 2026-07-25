import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetProductService {
  constructor(
    private productsRepository: ProductsRepository,
    private productImages: ProductsImagesRepository,
  ) {}

  async execute(productId: string) {
    const product = await this.productsRepository.findById(productId);

    if (!product || product.status === 'INATIVO') {
      throw new NotFoundException('Resorce Not found');
    }

    const images = await this.productImages.findManyByProductId(productId);

    if(images.length === 0){
        throw new NotFoundException('Resorce Not Found')
    }

    return {
        product,
        images
    }
  }
}
