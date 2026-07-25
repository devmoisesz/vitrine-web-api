import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { makeStore } from '../../../../test/factories/make-store';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { makeProductImage } from '../../../../test/factories/make-product-image';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import { GetProductService } from './get-product.service';
import { NotFoundException } from '@nestjs/common';

describe('List Products Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let productsImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let sut: GetProductService;

  beforeEach(() => {
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository(
      storesRepository,
      productsImagesRepository,
    );
    sut = new GetProductService(productsRepository, productsImagesRepository);
  });

  it('must return the product', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    const product = await productsRepository.create({
      name: 'Pants black',
      slug: 'pants-black',
      description: 'Good Pants Black Masculine',
      price: 40,
      sizes: ['M', 'G'],
      stock: 10,
      categoryId: category.id,
      storeId: store.id,
      subcategoryId: subcategory.id,
      tags: ['Pants', 'Black', 'Masculine'],
      status: 'ATIVO',
    });

    await makeProductImage(productsImagesRepository, {
      productId: product.id,
      is_main: true,
    });

    await makeProductImage(productsImagesRepository, {
      productId: product.id,
      is_main: false,
    });

    await makeProductImage(productsImagesRepository, {
      productId: product.id,
      is_main: false,
    });

    const result = await sut.execute(product.id);

    expect(result.product.id).toEqual(product.id);
  });

  it('must not allow the return of an inactivate product', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    const product = await productsRepository.create({
      name: 'Pants black',
      slug: 'pants-black',
      description: 'Good Pants Black Masculine',
      price: 40,
      sizes: ['M', 'G'],
      stock: 10,
      categoryId: category.id,
      storeId: store.id,
      subcategoryId: subcategory.id,
      tags: ['Pants', 'Black', 'Masculine'],
      status: 'INATIVO',
    });

    await makeProductImage(productsImagesRepository, {
      productId: product.id,
      is_main: true,
    });

    await expect(() => sut.execute(product.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should not allow the return of a product without an image', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    const product = await productsRepository.create({
      name: 'Pants black',
      slug: 'pants-black',
      description: 'Good Pants Black Masculine',
      price: 40,
      sizes: ['M', 'G'],
      stock: 10,
      categoryId: category.id,
      storeId: store.id,
      subcategoryId: subcategory.id,
      tags: ['Pants', 'Black', 'Masculine'],
      status: 'ATIVO',
    });

    await expect(() => sut.execute(product.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
