import {
  ConflictException,
  Injectable,
  BadRequestException
} from '@nestjs/common';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';
import { StorageService } from '@/storage/storage.service';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class UploadProductImagesService {
  constructor(
    private productsRepository: ProductsRepository,
    private storesRepository: StoresRepository,
    private storageService: StorageService,
    private productsImagesRepository: ProductsImagesRepository,
  ) {}

  async execute(
    slug: string,
    productId: string, 
    file: Express.Multer.File, 
    isMainRequested?: boolean 
  ) {
    const store = await this.storesRepository.findBySlug(slug)

    if (!store) {
      throw new ConflictException('Store not found for this product.');
    }

    const existingImages = await this.productsImagesRepository.findManyByProductId(productId);
    
    if (existingImages.length >= 5) {
      throw new BadRequestException('This product has already reached the maximum limit of 5 images..');
    }

    let isMain = false;

    if (existingImages.length === 0) {
      isMain = true;
    } else {
      const alreadyHasMain = existingImages.some((img) => img.is_main === true);

      if (isMainRequested) {
        if (alreadyHasMain) {
          throw new BadRequestException(
            'This product already has an active main image. Uncheck it first to set another one..',
          );
        }
        isMain = true;
      }
    }

    const image = await this.storageService.upload({
      body: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
      folder: `vitrine-web/${store.slug}/products/${productId}`,
    });

    await this.productsRepository.activateProduct(productId, 'ATIVO');
    
    return await this.productsImagesRepository.create({
      image_url: image.url,
      storage_public_id: image.public_id,
      productId,
      is_main: isMain, 
    });

  }
}