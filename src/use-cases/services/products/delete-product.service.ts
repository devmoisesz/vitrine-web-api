import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';
import { StorageService } from '@/storage/storage.service';

@Injectable()
export class DeleteProductService {
  constructor(
    private productsRepository: ProductsRepository,
    private productsImagesRepository: ProductsImagesRepository,
    private storageService: StorageService,
  ) {}

  async execute(productId: string): Promise<void> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Resource not found');
    }

    const images = await this.productsImagesRepository.findManyByProductId(
      product.id,
    );

    for (const image of images) {
      await this.storageService.delete(image.storage_public_id);
    }

    await this.productsRepository.delete(product.id);
  }
}
