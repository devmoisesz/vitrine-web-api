import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CategoriesRepository } from '@/database/repositories/categories-repository';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { Category } from '@prisma/client';

@Injectable()
export class EditCategoryService {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private generatorSlugUnique: SlugGeneratorService
  ) {}

  async execute(slug: string, newName: string): Promise<Category> {
    const category = await this.categoriesRepository.findBySlug(slug)

    if(!category){
        throw new BadRequestException('Category not registered')
    }

    const isNewCategoryExists = await this.categoriesRepository.findByName(newName)

    if(isNewCategoryExists){
        throw new ConflictException('Category already registered')
    }

    const newSlug = await this.generatorSlugUnique.execute(newName)

    return await this.categoriesRepository.save({
        id: category.id,
        name: newName,
        slug: newSlug,
        createdAt: category.createdAt
    })
  }
}