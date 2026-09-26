import type { Product, ProductImages, Store } from '@prisma/client';

export type PublicStoreDto = Pick<
  Store,
  'id' | 'name' | 'slug' | 'description' | 'logo_image_url' | 'bannerUrl'
>;

export type PublicProductImageDto = Pick<
  ProductImages,
  'id' | 'image_url' | 'is_main'
>;

export type PublicHomeProductDto = Pick<
  Product,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'sizes'
  | 'stock'
  | 'status'
  | 'storeId'
  | 'categoryId'
  | 'subcategoryId'
> & {
  price: string;
  createdAt: string;
  products_images: PublicProductImageDto[];
};

export type PublicHomeStoreDto = PublicStoreDto & {
  products: PublicHomeProductDto[];
};
