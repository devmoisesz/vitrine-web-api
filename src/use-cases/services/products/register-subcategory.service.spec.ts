import { beforeEach, describe, expect, it } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { RegisterSubcategoryService } from './register-subcategory.service';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';

let categoriesRepository: CategoriesInMemoryRepository;
let subcategoriesRepository: SubcategoriesInMemoryRepository;
let sut: RegisterSubcategoryService;

describe('Register Subcategory Service', () => {
  beforeEach(() => {
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    sut = new RegisterSubcategoryService(
      categoriesRepository,
      subcategoriesRepository,
    );
  });

  it('should be possible to register Subcategory.', async () => {
    const category = await makeCategory(categoriesRepository)

    const result = await sut.execute('new subcategory', category.slug);

    expect(result.name).toEqual('new subcategory');
    expect(result.slug).toEqual('new-subcategory');
    expect(result.categoryId).toEqual(category.id);
  });

  it('must not allow the registration of a subcategory that is already registered.', async () => {
    const category = await makeCategory(categoriesRepository)
    const subcategory = await makeSubCategory(subcategoriesRepository, category.id)

    await expect(() =>
      sut.execute(subcategory.name, category.slug),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should not be possible to register a subcategory without a category.', async () => {
    await expect(() =>
      sut.execute('subcategory', 'not exists'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
