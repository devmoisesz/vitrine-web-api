import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { RegisterCategoryService } from './register-category.service';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';

let categoriesRepository: CategoriesInMemoryRepository;
let generatorSlugUnique: SlugGeneratorService;
let storesRepository: StoresInMemoryRepository;
let sut: RegisterCategoryService;

describe('Register Category Service', () => {
  beforeEach(() => {
    categoriesRepository = new CategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    generatorSlugUnique = new SlugGeneratorService(storesRepository);
    sut = new RegisterCategoryService(
      categoriesRepository,
      generatorSlugUnique,
    );
  });

  it('should be possible to register category.', async () => {
    const result = await sut.execute('new category');

    expect(result.name).toEqual('new category');
    expect(result.slug).toEqual('new-category');
  });

  it('should not be possible to register a category that already exists..', async () => {
    const category = await makeCategory(categoriesRepository)

    await expect(() =>
      sut.execute(category.name),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
