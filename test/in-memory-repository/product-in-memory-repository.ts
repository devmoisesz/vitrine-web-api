import { randomUUID } from 'node:crypto';
import { Product, Tag } from '@prisma/client';
import {
  CreateProductInput,
  ProductsRepository,
  UpdateProductInput,
} from '@/database/repositories/products-repository';
import { Decimal } from '@prisma/client/runtime/client';

export class ProductsInMemoryRepository implements ProductsRepository {
  public items: Product[] = [];
  public tags: Tag[] = [];

  async findById(id: string): Promise<Product | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async activateProduct(productId: string, status: 'ATIVO'): Promise<void> {
    const product = this.items.find((item) => item.id === productId);

    if (product) {
      product.status = status;
    }
  }

  public productTags: { productId: string; tagId: string }[] = [];

  async save(product: UpdateProductInput): Promise<Product> {
    const currentProduct = this.items.find((item) => item.id === product.id);

    if (!currentProduct) {
      throw new Error('Product not found');
    }

    Object.assign(currentProduct, {
      name: product.name ?? currentProduct.name,
      slug: product.slug ?? currentProduct.slug,
      description: product.description ?? currentProduct.description,
      price: product.price ? new Decimal(product.price) : currentProduct.price,
      stock: product.stock ?? currentProduct.stock,
      status: product.status ?? currentProduct.status,
      storeId: product.storeId ?? currentProduct.storeId,
      categoryId: product.categoryId ?? currentProduct.categoryId,
      subcategoryId: product.subcategoryId ?? currentProduct.subcategoryId,
    });

    if (typeof product.tags !== 'undefined') {
      this.productTags = this.productTags.filter(
        (item) => item.productId !== product.id,
      );

      for (const tagName of product.tags) {
        let tag = this.tags.find((item) => item.name === tagName);

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
    }

    return currentProduct;
  }

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
