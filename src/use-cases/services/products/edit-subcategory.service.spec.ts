import { beforeEach, describe, expect, it } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { makeCategory } from '../../../../test/factories/make-category';
import { EditSubcategoryService } from './edit-subcategory.service';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';

let subcategoriesRepository: SubcategoriesInMemoryRepository;
let categoriesRepository: CategoriesInMemoryRepository;
let sut: EditSubcategoryService;

describe('Edit Subcategory Service', () => {
  beforeEach(() => {
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    sut = new EditSubcategoryService(
      subcategoriesRepository,
      categoriesRepository
    );
  });

  it('should be possible to edit subcategory.', async () => {
    const category = await makeCategory(categoriesRepository)

    const subcategory = await makeSubCategory(subcategoriesRepository, category.id)

    const result = await sut.execute(category.slug, subcategory.id, 'new subcategory');

    expect(result.name).toEqual('new subcategory');
    expect(result.slug).toEqual('new-subcategory');
  });

  it('should not be possible to edit a subcategory that does not exist.', async () => {
    const category = await makeCategory(categoriesRepository)

    await expect(() =>
      sut.execute(category.slug, 'not exists', 'new subcategory'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be possible to edit a subcategory that does not exist.', async () => {
    await expect(() =>
      sut.execute('not exists', 'not exists', 'new subcategory'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not be possible to edit a subcategory with the name of another subcategory.', async () => {
    const category = await makeCategory(categoriesRepository)

    const subcategory1 = await makeSubCategory(subcategoriesRepository, category.id)
    const subcategory2= await makeSubCategory(subcategoriesRepository, category.id)

    await expect(() =>
      sut.execute(category.slug, subcategory1.id, subcategory2.name),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
