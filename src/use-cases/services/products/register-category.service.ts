import { ConflictException, Injectable } from '@nestjs/common';
import { CategoriesRepository } from '@/database/repositories/categories-repository';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';

@Injectable()
export class RegisterCategoryService {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private generatorSlugUnique: SlugGeneratorService
  ) {}

  async execute(name: string) {
    const isCategoryExists = await this.categoriesRepository.findByName(name)

    if(isCategoryExists){
        throw new ConflictException('Category already registered')
    }

    const slug = await this.generatorSlugUnique.execute(name)

    return await this.categoriesRepository.create({
        name, 
        slug
    })
  }
}