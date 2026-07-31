import { Product } from '@prisma/client';

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  sizes: string[];
  stock: number;
  status?: 'ATIVO' | 'INATIVO';
  storeId: string;
  categoryId: string;
  subcategoryId: string;
  tags: string[];
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  sizes?: string[];
  stock?: number;
  status?: 'ATIVO' | 'INATIVO';
  storeId?: string;
  categoryId?: string;
  subcategoryId?: string;
  tags?: string[];
}

export abstract class ProductsRepository {
  abstract create(data: CreateProductInput): Promise<Product>;
  abstract save(product: UpdateProductInput): Promise<Product>;
  abstract activateProduct(id: string, status: 'ATIVO'): Promise<void>;
  abstract disableProduct(id: string, status: 'INATIVO'): Promise<void>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findMany(
    page: number,
    name?: string,
    categoryId?: string,
    subcategoryId?: string,
  ): Promise<{ products: Product[], total: number }>;
  abstract findManyByStore(
    storeId: string,
    page: number,
    name?: string,
    categoryId?: string,
    subcategoryId?: string,
  ): Promise<{products: Product[], total: number}>;
  abstract findAllByStoreManage(
    storeId: string,
    page: number,
    name?: string,
    categoryId?: string,
    subcategoryId?: string,
    status?: 'ATIVO' | 'INATIVO'
  ): Promise<{products: Product[], total: number}>;
  abstract delete(id: string): Promise<void>;
}
