import { Product } from '@prisma/client';

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  status?: 'ATIVO' | 'INATIVO';
  storeId: string;
  categoryId: string;
  subcategoryId: string;
  tags: string[];
}

export abstract class ProductsRepository {
  abstract create(data: CreateProductInput): Promise<Product>;
  abstract activateProduct(id: string, status: 'ATIVO'): Promise<void>
  abstract findById(id: string): Promise<Product | null>
}
