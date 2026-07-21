import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { ListSubcategoriesService } from './list-subcategories.service';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';

let categoriesRepository: CategoriesInMemoryRepository;
let subcategoriesRepository: SubcategoriesInMemoryRepository;
let sut: ListSubcategoriesService;

describe('List subcategories Service', () => {
  beforeEach(() => {
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    sut = new ListSubcategoriesService(subcategoriesRepository);
  });

  it('should return all subcategories.', async () => {
    const category = await makeCategory(categoriesRepository)

    for (let i = 0; i < 40; i++) {
      await makeSubCategory(subcategoriesRepository, category.id)
    }

    const result = await sut.execute();

    expect(result).toHaveLength(40)
  });

  it('should return only the subcategories of a specific category.', async () => {
    const category1 = await makeCategory(categoriesRepository)
    const category2 = await makeCategory(categoriesRepository)

    for (let i = 0; i < 20; i++) {
      await makeSubCategory(subcategoriesRepository, category1.id)
    }

    for (let i = 0; i < 30; i++) {
      await makeSubCategory(subcategoriesRepository, category2.id)
    }

    const result = await sut.execute(category2.id);

    expect(result).toHaveLength(30)
  });

  it('should return an empty array.', async () => {
    const result = await sut.execute();

    expect(result).toHaveLength(0)
  });
});
