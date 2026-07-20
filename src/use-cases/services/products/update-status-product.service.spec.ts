import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { makeStore } from '../../../../test/factories/make-store';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateStatusProductService } from './update-status-product.service';

describe('Update Status Product Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let sut: UpdateStatusProductService;

  beforeEach(() => {
    productsRepository = new ProductsInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    sut = new UpdateStatusProductService(
      productsRepository,
    );
  });

  it('must deactivate the product', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    const product = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 10,
      stock: 1,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await sut.execute(product.id, 'INATIVO');

    const updatedProduct = await productsRepository.findById(product.id);

    expect(updatedProduct?.status).toEqual('INATIVO');
    expect(updatedProduct?.status).not.toEqual('ATIVO');
  });

  it('must activate the product', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    const product = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 10,
      stock: 1,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await sut.execute(product.id, 'ATIVO');

    const updatedProduct = await productsRepository.findById(product.id);

    expect(updatedProduct?.status).toEqual('ATIVO');
    expect(updatedProduct?.status).not.toEqual('INATIVO');
  });

  it('must not allow the operation to be performed with an invalid product..', async () => {
    await expect(() =>
      sut.execute('not exists', 'ATIVO'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should generate a conflict when attempting to deactivate a product that is already deactivated.', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    const product = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 10,
      stock: 1,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await expect(() =>
      sut.execute(product.id, 'INATIVO'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should cause a conflict when attempting to activate a product that is already activated.', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    const product = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 10,
      stock: 1,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await expect(() =>
      sut.execute(product.id, 'ATIVO'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
