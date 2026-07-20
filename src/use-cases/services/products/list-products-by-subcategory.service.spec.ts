import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { makeStore } from '../../../../test/factories/make-store';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { makeProducts } from '../../../../test/factories/make-product';
import { makeProductImage } from '../../../../test/factories/make-product-image';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import { NotFoundException } from '@nestjs/common';
import { ListProductsBySubcategoryService } from './list-products-by-subcategory.service';

describe('List Products By Subcategory Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let productsImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let sut: ListProductsBySubcategoryService;

  beforeEach(() => {
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository(
      storesRepository,
      productsImagesRepository,
    );
    sut = new ListProductsBySubcategoryService(
      productsRepository,
      categoriesRepository,
      subcategoriesRepository,
    );
  });

  it('must return the products filtered by subcategory.', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository, 'category-slug');

    const subcategory1 = await makeSubCategory(
      subcategoriesRepository,
      category.id,
      'subcategory-slug1',
    );

    const subcategory2 = await makeSubCategory(
      subcategoriesRepository,
      category.id,
      'subcategory-slug2',
    );

    for (let i = 0; i < 1; i++) {
      const product = await makeProducts(
        productsRepository,
        store.id,
        category.id,
        subcategory1.id,
        'ATIVO',
      );
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
      });
    }

    for (let i = 0; i < 10; i++) {
      const product = await makeProducts(
        productsRepository,
        store.id,
        category.id,
        subcategory2.id,
        'ATIVO',
      );
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
      });
    }

    const page = 1;

    const result = await sut.execute(category.slug, subcategory2.slug, page);

    expect(result).toHaveLength(10);
  });

  it('should not be possible to list products from a subcategory by sending the wrong parent category.', async () => {
    const store = await makeStore(storesRepository);

    const category1 = await makeCategory(categoriesRepository, 'category-slug');
    const category2 = await makeCategory(
      categoriesRepository,
      'category-slug-2',
    );

    const subcategory1 = await makeSubCategory(
      subcategoriesRepository,
      category1.id,
      'subcategory-slug1',
    );

    const subcategory2 = await makeSubCategory(
      subcategoriesRepository,
      category2.id,
      'subcategory-slug2',
    );

    for (let i = 0; i < 1; i++) {
      const product = await makeProducts(
        productsRepository,
        store.id,
        category1.id,
        subcategory1.id,
        'ATIVO',
      );
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
      });
    }

    for (let i = 0; i < 10; i++) {
      const product = await makeProducts(
        productsRepository,
        store.id,
        category2.id,
        subcategory2.id,
        'ATIVO',
      );
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
      });
    }

    const page = 1;

    await expect(() =>
      sut.execute(category1.slug, subcategory2.slug, page),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow listing products from a non-existent category', async () => {
    const page = 1;

    await expect(() =>
      sut.execute('not exists', 'not exits', page),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow listing products from a non-existent subcategory', async () => {
    const category = await makeCategory(categoriesRepository);

    const page = 1;

    await expect(() =>
      sut.execute(category.id, 'not exits', page),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should return the products from page 2', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for (let i = 0; i < 50; i++) {
      const product = await makeProducts(
        productsRepository,
        store.id,
        category.id,
        subcategory.id,
        'ATIVO',
      );
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
      });
    }

    const page = 2;

    const result = await sut.execute(category.slug, subcategory.slug, page);

    expect(result).toHaveLength(10);
  });

  it('should return an empty list because the product stores are inactive.', async () => {
    const store = await makeStore(storesRepository, undefined, 'INATIVA');

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for (let i = 0; i < 10; i++) {
      const product = await makeProducts(
        productsRepository,
        store.id,
        category.id,
        subcategory.id,
        'ATIVO',
      );
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
      });
    }

    const page = 1;

    const result = await sut.execute(category.slug, subcategory.slug, page);

    expect(result).toHaveLength(0);
  });
});
