import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { makeStore } from '../../../../test/factories/make-store';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { EditProductService } from './edit-product.service';
import { NotFoundException } from '@nestjs/common';

describe('Edit Product Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let sut: EditProductService;

  beforeEach(() => {
    productsRepository = new ProductsInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    sut = new EditProductService(
      productsRepository,
      categoriesRepository,
      subcategoriesRepository,
    );
  });

  it('should be possible to edit a product and its tags', async () => {
    const store = await makeStore(storesRepository);

    const firstCategory = await makeCategory(categoriesRepository);

    const firstSubcategory = await makeSubCategory(
      subcategoriesRepository,
      firstCategory.id,
    );

    const newCategory = await makeCategory(categoriesRepository);

    const newSubcategory = await makeSubCategory(
      subcategoriesRepository,
      newCategory.id,
    );

    const product = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 10,
      sizes: ["P", "M", "G"],
      stock: 1,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: firstCategory.id,
      subcategoryId: firstSubcategory.id,
      tags: ['old-tag'],
    });

    await sut.execute(product.id, {
      newTags: ['new-tag', 'another-tag'],
      newDescription: 'updated description',
      newPrice: 15.5,
      newStock: 3,
      newCategory: newCategory.name,
      newSubcategory: newSubcategory.name,
    });

    const updatedProduct = await productsRepository.findById(product.id);

    expect(updatedProduct?.name).toEqual('old product');
    expect(updatedProduct?.description).toEqual('updated description');
    expect(updatedProduct?.price.toString()).toEqual('15.5');
    expect(updatedProduct?.stock).toEqual(3);
    expect(
      productsRepository.productTags.filter(
        (item) => item.productId === product.id,
      ),
    ).toHaveLength(2);
  });

  it('should not allow editing a non-existent product.', async () => {
    await expect(() =>
      sut.execute('not exits', {
        newTags: ['new-tag', 'another-tag'],
        newDescription: 'updated description',
        newPrice: 15.5,
        newStock: 3,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow editing a product by submitting a non-existent category.', async () => {
    const store = await makeStore(storesRepository);

    const firstCategory = await makeCategory(categoriesRepository);

    const firstSubcategory = await makeSubCategory(
      subcategoriesRepository,
      firstCategory.id,
    );

    const product = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 10,
      sizes: ["P", "M"],
      stock: 1,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: firstCategory.id,
      subcategoryId: firstSubcategory.id,
      tags: ['old-tag'],
    });

    await expect(() =>
      sut.execute(product.id, {
        newTags: ['new-tag', 'another-tag'],
        newDescription: 'updated description',
        newPrice: 15.5,
        newStock: 3,
        newCategory: 'not exists',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow editing a product by submitting a non-existent subcategory.', async () => {
    const store = await makeStore(storesRepository);

    const firstCategory = await makeCategory(categoriesRepository);

    const firstSubcategory = await makeSubCategory(
      subcategoriesRepository,
      firstCategory.id,
    );

    const newCategory = await makeCategory(categoriesRepository);

    const product = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 10,
      sizes: ["P", "M"],
      stock: 1,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: firstCategory.id,
      subcategoryId: firstSubcategory.id,
      tags: ['old-tag'],
    });

    await expect(() =>
      sut.execute(product.id, {
        newTags: ['new-tag', 'another-tag'],
        newDescription: 'updated description',
        newPrice: 15.5,
        newStock: 3,
        newCategory: newCategory.name,
        newSubcategory: 'not exits'
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
