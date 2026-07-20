import { CategoriesRepository } from '@/database/repositories/categories-repository';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';

@Injectable()
export class ListProductsByCategoryService {
  constructor(
    private productsRepository: ProductsRepository,
    private categoriesRepository: CategoriesRepository,
  ) {}

  async execute(slug: string, page: number): Promise<Product[]> {
    const category = await this.categoriesRepository.findBySlug(slug);

    if (!category) {
      throw new NotFoundException('Resource not found');
    }

    return await this.productsRepository.findManyByCategory(category.id, page);
  }
}
