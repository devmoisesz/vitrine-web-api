import type { Store } from '@prisma/client';
import type { StoreWithProducts } from '@/database/repositories/stores-repository';
import type {
  PublicHomeStoreDto,
  PublicStoreDto,
} from './dtos/public-store.dto';

export function toPublicStore(store: Store): PublicStoreDto {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    logo_image_url: store.logo_image_url,
    bannerUrl: store.bannerUrl,
  };
}

export function toPublicHomeStore(
  store: StoreWithProducts,
): PublicHomeStoreDto {
  return {
    ...toPublicStore(store),
    products: store.products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      sizes: product.sizes,
      stock: product.stock,
      status: product.status,
      storeId: product.storeId,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      createdAt: product.createdAt.toISOString(),
      products_images: (product.products_images ?? []).map((image) => ({
        id: image.id,
        image_url: image.image_url,
        is_main: image.is_main,
      })),
    })),
  };
}
