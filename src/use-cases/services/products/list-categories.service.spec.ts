import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { ListCategoriesService } from './list-categories.service';

let categoriesRepository: CategoriesInMemoryRepository;
let sut: ListCategoriesService;

describe('List categories Service', () => {
  beforeEach(() => {
    categoriesRepository = new CategoriesInMemoryRepository();
    sut = new ListCategoriesService(categoriesRepository);
  });

  it('should return all categories.', async () => {
    for (let i = 0; i < 40; i++) {
      await makeCategory(categoriesRepository);
    }

    const result = await sut.execute();

    expect(result).toHaveLength(40)
  });

  it('should return an empty array.', async () => {
    const result = await sut.execute();

    expect(result).toHaveLength(0)
  });
});
