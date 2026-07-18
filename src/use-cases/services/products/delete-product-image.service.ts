import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';
import { StorageService } from '@/storage/storage.service';

@Injectable()
export class DeleteProductImageService {
  constructor(
    private productsRepository: ProductsRepository,
    private storageService: StorageService,
    private productsImagesRepository: ProductsImagesRepository,
  ) {}

  async execute(productId: string, imageId: string, nextMainImageId?: string) {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    const imageToDelete = await this.productsImagesRepository.findById(imageId);

    if (!imageToDelete || imageToDelete.productId !== productId) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    await this.storageService.delete(imageToDelete.storage_public_id);

    await this.productsImagesRepository.remove(imageId);

    if (imageToDelete.is_main === false) {
      return;
    }

    const remainingImages =
      await this.productsImagesRepository.findManyByProductId(productId);

    if (remainingImages.length === 0) {
      return;
    }

    if (!nextMainImageId) {
      const mostRecentImage = remainingImages.reduce((prev, current) => {
        return prev.createdAt > current.createdAt ? prev : current;
      });

      nextMainImageId = mostRecentImage.id
    }

    await this.productsImagesRepository.updateToMain(nextMainImageId)
  }
}
