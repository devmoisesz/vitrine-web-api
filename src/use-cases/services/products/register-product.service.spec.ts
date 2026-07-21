import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { RegisterProductService } from './register-product.service';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';

let productsRepository: ProductsInMemoryRepository
let categoriesRepository: CategoriesInMemoryRepository;
let subcategoriesRepository: SubcategoriesInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let sut: RegisterProductService;

describe('Register Product Service', () => {
  beforeEach(() => {
    productsRepository = new ProductsInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    sut = new RegisterProductService(
      productsRepository,
      categoriesRepository,
      subcategoriesRepository,
      storesRepository
    );
  });

  it('should be possible to register product.', async () => {
    const store = await makeStore(storesRepository)

    const category = await makeCategory(categoriesRepository)

    const subcategory = await makeSubCategory(subcategoriesRepository, category.id)

    const result = await sut.execute(store.slug, {
        name_product: 'product black',
        description: 'good product black',
        price: 59.90,
        sizes: ["P", "M"],
        stock: 99,
        tags: ['black'],
        name_category: category.name,
        name_subcategory: subcategory.name,
    });

    expect(result.name).toEqual('product black');
    expect(result.slug).toEqual('product-black');
    expect(productsRepository.items[0].categoryId).toEqual(category.id)
    expect(productsRepository.items[0].subcategoryId).toEqual(subcategory.id)
  });

  it('should be possible to register a product without a store.', async () => {
    const category = await makeCategory(categoriesRepository)

    const subcategory = await makeSubCategory(subcategoriesRepository, category.id)

    await expect(() =>
      sut.execute('not exits', {
        name_product: 'product black',
        description: 'good product black',
        price: 59.90,
        sizes: ["P", "M"],
        stock: 99,
        tags: ['black'],
        name_category: category.name,
        name_subcategory: subcategory.name,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should be possible to register a product without a category.', async () => {
    const store = await makeStore(storesRepository)

    const subcategory = await makeSubCategory(subcategoriesRepository, '')

    await expect(() =>
      sut.execute(store.slug, {
        name_product: 'product black',
        description: 'good product black',
        price: 59.90,
        sizes: ["P", "M"],
        stock: 99,
        tags: ['black'],
        name_category: 'not exits',
        name_subcategory: subcategory.name,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should be possible to register a product without a subcategory.', async () => {
    const store = await makeStore(storesRepository)

    const category = await makeCategory(categoriesRepository)

    await expect(() =>
      sut.execute(store.slug, {
        name_product: 'product black',
        description: 'good product black',
        price: 59.90,
        sizes: ["P", "M"],
        stock: 99,
        tags: ['black'],
        name_category: category.name,
        name_subcategory: 'not exits',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
