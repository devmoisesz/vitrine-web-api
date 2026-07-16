import { faker } from '@faker-js/faker';
import { ProductsImagesInMemoryRepository } from '../in-memory-repository/product-images-in-memory-repository';

interface Override {
  productId?: string;
  is_main?: boolean;
}

export async function makeProductImage(
  inMemoryProductsImagesRepository: ProductsImagesInMemoryRepository,
  override: Override = {},
) {
  return inMemoryProductsImagesRepository.create({
    image_url: faker.image.url(),
    storage_public_id: `mock-folder/products/file-${faker.string.uuid()}`,
    productId: override.productId ?? faker.string.uuid(),
    is_main: override.is_main ?? false, 
  });
}