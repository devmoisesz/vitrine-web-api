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
import { ListProductsByCategoryService } from './list-products-by-category.service';
import { NotFoundException } from '@nestjs/common';

describe('List Products By Category Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let productsImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let sut: ListProductsByCategoryService;

  beforeEach(() => {
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository(
      storesRepository,
      productsImagesRepository,
    );
    sut = new ListProductsByCategoryService(
      productsRepository,
      categoriesRepository,
    );
  });

  it('must return only the products from the requested category', async () => {
    const store = await makeStore(storesRepository);

    const category1 = await makeCategory(categoriesRepository, '1-slug');
    const category2 = await makeCategory(categoriesRepository, '2-slug');

    const subcategory1 = await makeSubCategory(
      subcategoriesRepository,
      category1.id,
    );

    const subcategory2 = await makeSubCategory(
      subcategoriesRepository,
      category2.id,
    );

    for (let i = 0; i < 20; i++) {
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

    const result = await sut.execute(category2.slug, page);

    expect(result).toHaveLength(10);
  });

  it('should not allow listing products from a non-existent category', async () => {
    const page = 1;

    await expect(() =>
      sut.execute('not exists', page),
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

    const result = await sut.execute(category.slug, page);

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

    const result = await sut.execute(category.slug, page);

    expect(result).toHaveLength(0);
  });

  it('should return an empty list because all the products are empty.', async () => {
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
      );
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
      });
    }

    const page = 1;

    const result = await sut.execute(category.slug, page);

    expect(result).toHaveLength(0);
  });

  it('should return only the active products', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for (let i = 0; i < 15; i++) {
      const product = await makeProducts(
        productsRepository,
        store.id,
        category.id,
        subcategory.id,
      );
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
      });
    }

    for (let i = 0; i < 15; i++) {
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

    const result = await sut.execute(category.slug, page);

    expect(result).toHaveLength(15);
  });
});
