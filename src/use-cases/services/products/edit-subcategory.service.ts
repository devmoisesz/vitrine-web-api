import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { Slug } from '@/use-cases/utils/slug';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';
import { CategoriesRepository } from '@/database/repositories/categories-repository';

@Injectable()
export class EditSubcategoryService {
  constructor(
    private subcategoriesRepository: SubcategoriesRepository,
    private categoriesRepository: CategoriesRepository,
  ) {}

  async execute(
    slug_category: string,
    id: string,
    newName: string,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findBySlug(slug_category);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const subcategory = await this.subcategoriesRepository.findById(id);

    if (!subcategory) {
      throw new BadRequestException('Subcategory not registered');
    }

    const isNewSubCategoryExists =
      await this.subcategoriesRepository.findByCategoryId(
        category.id,
        newName,
      );

    if (isNewSubCategoryExists) {
      throw new ConflictException('Subcategory already registered');
    }

    const newSlug = Slug.createFromText(newName);

    return await this.subcategoriesRepository.save({
      id: subcategory.id,
      name: newName,
      slug: newSlug,
      categoryId: subcategory.categoryId,
      createdAt: subcategory.createdAt,
    });
  }
}
