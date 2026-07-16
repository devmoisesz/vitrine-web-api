import { beforeEach, describe, expect, it } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { EditCategoryService } from './edit-category.service';

let categoriesRepository: CategoriesInMemoryRepository;
let generatorSlugUnique: SlugGeneratorService;
let storesRepository: StoresInMemoryRepository;
let sut: EditCategoryService;

describe('Edit Category Service', () => {
  beforeEach(() => {
    categoriesRepository = new CategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    generatorSlugUnique = new SlugGeneratorService(storesRepository);
    sut = new EditCategoryService(
      categoriesRepository,
      generatorSlugUnique,
    );
  });

  it('should be possible to edit category.', async () => {
    const category = await makeCategory(categoriesRepository)

    const result = await sut.execute(category.slug, 'new category');

    expect(result.name).toEqual('new category');
    expect(result.slug).toEqual('new-category');
  });

  it('should not be possible to edit a category that does not exist.', async () => {
    await expect(() =>
      sut.execute('not exists', 'new category'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be possible to edit a category with the name of another category.', async () => {
    const category1 = await makeCategory(categoriesRepository)
    const category2 = await makeCategory(categoriesRepository)

    await expect(() =>
      sut.execute(category2.slug, category1.name),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
