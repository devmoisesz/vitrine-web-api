import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';

@Injectable()
export class SetMainImageService {
  constructor(
    private productsRepository: ProductsRepository,
    private productsImagesRepository: ProductsImagesRepository,
  ) {}

  async execute(productId: string, imageId: string) {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    const images = await this.productsImagesRepository.findManyByProductId(
      product.id,
    );

    const currentMainImage = images.find((image) => image.is_main === true);

    const newImageMain = images.find((image) => image.id === imageId);

    if (!newImageMain) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    if (newImageMain.is_main) {
      throw new ConflictException(
        'Unable to complete the requested operation.',
      );
    }

    if (currentMainImage) {
      await this.productsImagesRepository.updateIsMain(
        currentMainImage.id,
        false,
      );
    }

    await this.productsImagesRepository.updateToMain(newImageMain.id);
  }
}
