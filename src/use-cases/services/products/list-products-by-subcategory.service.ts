import { CategoriesRepository } from '@/database/repositories/categories-repository';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';

@Injectable()
export class ListProductsBySubcategoryService {
  constructor(
    private productsRepository: ProductsRepository,
    private categoriesRepository: CategoriesRepository,
    private subcategoriesRepository: SubcategoriesRepository
  ) {}

  async execute(slugCategory: string, slugSubcategory: string, page: number): Promise<Product[]> {
    const category = await this.categoriesRepository.findBySlug(slugCategory)

    if (!category) {
      throw new NotFoundException('Resource not found');
    }

    const subcategory = await this.subcategoriesRepository.findBySlug(slugSubcategory, category.id)

    if(!subcategory) {
        throw new NotFoundException('Resource not found')
    }

    return await this.productsRepository.findManyBySubcategory(category.id, subcategory.id, page)
  }
}
