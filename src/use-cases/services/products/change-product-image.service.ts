import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';
import { StorageService } from '@/storage/storage.service';
import { replaceStoredImage } from '@/storage/replace-stored-image';

@Injectable()
export class ChangeProductImageService {
  constructor(
    private productsRepository: ProductsRepository,
    private storageService: StorageService,
    private productsImagesRepository: ProductsImagesRepository,
  ) {}

  async execute(
    storeSlug: string,
    productId: string,
    imageId: string,
    file: Express.Multer.File,
  ) {
    const product = await this.productsRepository.findByIdAndStoreSlug(
      productId,
      storeSlug,
    );

    if (!product) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    const image = await this.productsImagesRepository.findById(imageId);

    if (!image || image.productId !== productId) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    return replaceStoredImage(
      this.storageService,
      image.storage_public_id,
      {
        body: file.buffer,
        fileName: file.originalname,
        contentType: file.mimetype,
        folder: `vitrine-web/${product.storeId}/products/${productId}`,
      },
      (newImage) => this.productsImagesRepository.replaceFile(
        imageId, newImage.url, newImage.public_id,
      ),
    );
  }
}
