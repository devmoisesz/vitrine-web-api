import { randomUUID } from 'node:crypto';
import { Product, Tag } from '@prisma/client';
import {
  CreateProductInput,
  ProductsRepository,
  UpdateProductInput,
} from '@/database/repositories/products-repository';
import { Decimal } from '@prisma/client/runtime/client';
import { StoresInMemoryRepository } from './stores-in-memory-repository';
import { ProductsImagesInMemoryRepository } from './product-images-in-memory-repository';

export class ProductsInMemoryRepository implements ProductsRepository {
  public items: Product[] = [];
  public tags: Tag[] = [];

  constructor(
    private storesRepository?: StoresInMemoryRepository,
    private productImagesRepository?: ProductsImagesInMemoryRepository,
  ) {}

  async findManyByCategory(
    categoryId: string,
    page: number,
  ): Promise<Product[]> {
    const pageSize = 40;

    let filteredProducts = this.items.filter((product) => {
      if (product.status !== 'ATIVO') {
        return false;
      }

      if (product.categoryId !== categoryId) {
        return false;
      }

      const store = this.storesRepository?.items.find(
        (s) => s.id === product.storeId,
      );

      if (!store || store.status !== 'ATIVA') {
        return false;
      }

      return true;
    });

    filteredProducts.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return paginatedProducts.map((product) => {
      const store = this.storesRepository?.items.find(
        (s) => s.id === product.storeId,
      );

      const mainImages = this.productImagesRepository?.items
        .filter((img) => img.productId === product.id && img.is_main === true)
        .map((img) => ({
          image_url: img.image_url,
        }));

      return {
        ...product,
        store: store
          ? {
              id: store.id,
              name: store.name,
              slug: store.slug,
              logo_image_url: store.logo_image_url,
            }
          : null,
        products_images: mainImages,
      };
    });
  }

  async delete(id: string): Promise<void> {
    const product = this.items.findIndex((item) => item.id === id);

    this.items.splice(product, 1);
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findMany(page: number, name?: string): Promise<Product[]> {
    const pageSize = 40;

    let filteredProducts = this.items.filter((product) => {
      if (product.status !== 'ATIVO') {
        return false;
      }

      const store = this.storesRepository?.items.find(
        (s) => s.id === product.storeId,
      );

      if (!store || store.status !== 'ATIVA') {
        return false;
      }

      return true;
    });

    if (name) {
      const searchTerm = name.toLowerCase();

      filteredProducts = filteredProducts.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const descriptionMatch = product.description
          ? product.description.toLowerCase().includes(searchTerm)
          : false;

        return nameMatch || descriptionMatch;
      });
    }

    filteredProducts.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return paginatedProducts.map((product) => {
      const store = this.storesRepository?.items.find(
        (s) => s.id === product.storeId,
      );

      const mainImages = this.productImagesRepository?.items
        .filter((img) => img.productId === product.id && img.is_main === true)
        .map((img) => ({
          image_url: img.image_url,
        }));

      return {
        ...product,
        store: store
          ? {
              id: store.id,
              name: store.name,
              slug: store.slug,
              logo_image_url: store.logo_image_url,
            }
          : null,
        products_images: mainImages,
      };
    });
  }

  async activateProduct(productId: string, status: 'ATIVO'): Promise<void> {
    const product = this.items.find((item) => item.id === productId);

    if (product) {
      product.status = status;
    }
  }

  async disableProduct(productId: string, status: 'INATIVO'): Promise<void> {
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
