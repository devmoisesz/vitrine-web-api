import { randomUUID } from 'node:crypto';
import { Product, Tag } from '@prisma/client'; // Ajuste o import conforme seus models
import { CreateProductInput, ProductsRepository } from '@/database/repositories/products-repository';
import { Decimal } from '@prisma/client/runtime/client';

export class ProductsInMemoryRepository implements ProductsRepository {
  public items: Product[] = [];
  public tags: Tag[] = [];

  async findById(id: string): Promise<Product | null> {
    const product = this.items.find((item) => item.id === id)

    if(!product) return null

    return product
  }

  async activateProduct(productId: string, status: 'ATIVO'): Promise<void> {
    const product = this.items.find((item) => item.id === productId)

    product!.status = status
  }
  
  public productTags: { productId: string; tagId: string }[] = [];

  async create(data: CreateProductInput): Promise<Product> {
    const product = {
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: new Decimal(data.price), 
      stock: data.stock,
      status: data.status ?? 'INATIVO',
      storeId: data.storeId,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      createdAt: new Date(),
    };

    this.items.push(product);

    for (const tagName of data.tags) {
      let tag = this.tags.find((t) => t.name === tagName);

      if (!tag) {
        tag = {
          id: randomUUID(),
          name: tagName,
        };
        this.tags.push(tag);
      }

      this.productTags.push({
        productId: product.id,
        tagId: tag.id,
      });
    }

    return product;
  }
}