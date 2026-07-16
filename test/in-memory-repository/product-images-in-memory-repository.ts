import { randomUUID } from 'node:crypto';
import { Prisma, ProductImages } from '@prisma/client'; // Ajuste o import conforme seus models
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';

export class ProductsImagesInMemoryRepository implements ProductsImagesRepository {
  public items: ProductImages[] = [];
  public productTags: { productId: string; tagId: string }[] = [];

  async findManyByProductId(productId: string): Promise<ProductImages[]> {
    return this.items.filter((item) => item.productId === productId);
  }


  async create(
    data: Prisma.ProductImagesUncheckedCreateInput,
  ): Promise<ProductImages> {
    const products = {
      id: randomUUID(),
      productId: data.productId,
      image_url: data.image_url,
      storage_public_id: data.storage_public_id,
      is_main: data.is_main ?? false,
    };

    this.items.push(products)

    return products
  }
}
