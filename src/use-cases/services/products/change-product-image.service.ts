import {
    Injectable, NotFoundException
} from '@nestjs/common';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';
import { StorageService } from '@/storage/storage.service';

@Injectable()
export class ChangeProductImageService {
  constructor(
    private productsRepository: ProductsRepository,
    private storageService: StorageService,
    private productsImagesRepository: ProductsImagesRepository,
  ) {}

  async execute(productId: string, imageId: string, file: Express.Multer.File) {
    const product = await this.productsRepository.findById(productId);

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

    await this.storageService.delete(image.storage_public_id);

    await this.productsImagesRepository.remove(imageId);

    const newImage = await this.storageService.upload({
      body: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
      folder: `vitrine-web/${product.storeId}/products/${productId}`,
    });

    await this.productsImagesRepository.create({
      image_url: newImage.url,
      storage_public_id: newImage.public_id,
      productId,
      is_main: image.is_main,
    });
  }
}
