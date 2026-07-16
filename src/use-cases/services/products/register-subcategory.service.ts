import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CategoriesRepository } from '@/database/repositories/categories-repository';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';
import { Slug } from '@/use-cases/utils/slug';

@Injectable()
export class RegisterSubcategoryService {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private subCategoriesRepository: SubcategoriesRepository,
  ) {}

  async execute(name_subcategory: string, slug_category: string) {
    const category = await this.categoriesRepository.findBySlug(slug_category)

    if(!category){
        throw new BadRequestException('Category not registered')
    }

    const isSubCategoryExists = await this.subCategoriesRepository.findByCategoryId(category.id, name_subcategory)

    if(isSubCategoryExists){
        throw new ConflictException('Subcategory already registered')
    }

    return await this.subCategoriesRepository.create({
        name: name_subcategory,
        slug: Slug.createFromText(name_subcategory),
        categoryId: category.id
    })
  }
}