import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { makeProductImage } from '../../../../test/factories/make-product-image';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { NotFoundException } from '@nestjs/common';
import { ListStoreManageProductsService } from './list-store-manage-products.service';
import { faker } from '@faker-js/faker';

describe('List Store Manage Products Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let productsImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let generatorSlugUnique: SlugGeneratorService;
  let sut: ListStoreManageProductsService;

  beforeEach(() => {
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    generatorSlugUnique = new SlugGeneratorService(storesRepository);
    productsRepository = new ProductsInMemoryRepository(
      storesRepository,
      productsImagesRepository,
    );
    sut = new ListStoreManageProductsService(
      productsRepository,
      storesRepository,
    );
  });

  it('should return only the filtered requests', async () => {
    const store = await storesRepository.create({
      name: 'Store Feminine',
      slug: await generatorSlugUnique.execute('Store Feminine'),
      whatsapp: makeWhatsapp(),
      description: 'Good Store Femine',
    });

    const categoryBlouse = await makeCategory(categoriesRepository);

    const subcategoryFeminine = await makeSubCategory(
      subcategoriesRepository,
      categoryBlouse.id,
    );

    for (let i = 0; i < 20; i++) {
      const product = await productsRepository.create({
        name: faker.commerce.productName(),
        slug: await generatorSlugUnique.execute(faker.commerce.productName()),
        description: faker.commerce.productDescription(),
        price: 40,
        sizes: ['P', 'M'],
        stock: 10,
        categoryId: categoryBlouse.id,
        storeId: store.id,
        subcategoryId: subcategoryFeminine.id,
        tags: ['Blouse', 'Black', 'Feminine'],
        status: 'ATIVO',
      });

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: product[0] ? true : false,
      });
    }

    for (let i = 0; i < 20; i++) {
      const product = await productsRepository.create({
        name: faker.commerce.productName(),
        slug: await generatorSlugUnique.execute(faker.commerce.productName()),
        description: faker.commerce.productDescription(),
        price: 40,
        sizes: ['P', 'M'],
        stock: 10,
        categoryId: categoryBlouse.id,
        storeId: store.id,
        subcategoryId: subcategoryFeminine.id,
        tags: ['Blouse', 'Black', 'Feminine'],
        status: 'INATIVO',
      });

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: product[0] ? true : false,
      });
    }

    const page = 1;

    const result = await sut.execute({
      slugStore: store.slug,
      page,
    });

    expect(result.products).toHaveLength(40);
    expect(result.total).toEqual(40);
  });

  it('should return only the inactive ones', async () => {
    const store = await storesRepository.create({
      name: 'Store Feminine',
      slug: await generatorSlugUnique.execute('Store Feminine'),
      whatsapp: makeWhatsapp(),
      description: 'Good Store Femine',
    });

    const categoryBlouse = await makeCategory(categoriesRepository);

    const subcategoryFeminine = await makeSubCategory(
      subcategoriesRepository,
      categoryBlouse.id,
    );

    for (let i = 0; i < 20; i++) {
      const product = await productsRepository.create({
        name: faker.commerce.productName(),
        slug: await generatorSlugUnique.execute(faker.commerce.productName()),
        description: faker.commerce.productDescription(),
        price: 40,
        sizes: ['P', 'M'],
        stock: 10,
        categoryId: categoryBlouse.id,
        storeId: store.id,
        subcategoryId: subcategoryFeminine.id,
        tags: ['Blouse', 'Black', 'Feminine'],
        status: 'ATIVO',
      });

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: product[0] ? true : false,
      });
    }

    for (let i = 0; i < 10; i++) {
      const product = await productsRepository.create({
        name: faker.commerce.productName(),
        slug: await generatorSlugUnique.execute(faker.commerce.productName()),
        description: faker.commerce.productDescription(),
        price: 40,
        sizes: ['P', 'M'],
        stock: 10,
        categoryId: categoryBlouse.id,
        storeId: store.id,
        subcategoryId: subcategoryFeminine.id,
        tags: ['Blouse', 'Black', 'Feminine'],
        status: 'INATIVO',
      });

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: product[0] ? true : false,
      });
    }

    const page = 1;

    const result = await sut.execute({
      slugStore: store.slug,
      page,
      status: 'INATIVO'
    });

    expect(result.products).toHaveLength(10);
    expect(result.total).toEqual(10);
  });

  it('should not allow filtering for a non-existent store.', async () => {
    const page = 1;

    await expect(() =>
      sut.execute({
        slugStore: 'not exists',
        page,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
