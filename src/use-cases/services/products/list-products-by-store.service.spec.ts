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
import { ListProductsByStoreService } from './list-products-by-store.service';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { NotFoundException } from '@nestjs/common';

describe('List Products By Store Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let productsImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let generatorSlugUnique: SlugGeneratorService;
  let sut: ListProductsByStoreService;

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
    sut = new ListProductsByStoreService(productsRepository, storesRepository);
  });

  it('should return only the filtered requests', async () => {
    const store1 = await storesRepository.create({
      name: 'Store Feminine',
      slug: await generatorSlugUnique.execute('Store Feminine'),
      whatsapp: makeWhatsapp(),
      description: 'Good Store Femine',
    });

    const store2 = await storesRepository.create({
      name: 'Store Masculine',
      slug: await generatorSlugUnique.execute('Store Masculine'),
      whatsapp: makeWhatsapp(),
      description: 'Good Store Masculine',
    });

    const categoryBlouse = await makeCategory(categoriesRepository);
    const categoryPants = await makeCategory(categoriesRepository);

    const subcategoryMasculine = await makeSubCategory(
      subcategoriesRepository,
      categoryPants.id,
    );

    const subcategoryFeminine = await makeSubCategory(
      subcategoriesRepository,
      categoryBlouse.id,
    );

    for (let i = 0; i < 20; i++) {
      const product = await productsRepository.create({
        name: 'blouse black',
        slug: 'blouse-black',
        description: 'Good Blouse Black Feminine',
        price: 40,
        sizes: ['P', 'M'],
        stock: 10,
        categoryId: categoryBlouse.id,
        storeId: store1.id,
        subcategoryId: subcategoryFeminine.id,
        tags: ['Blouse', 'Black', 'Feminine'],
        status: 'ATIVO',
      });

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: product[0] ? true : false,
      });
    }

    const product = await productsRepository.create({
      name: 'Pants black',
      slug: 'pants-black',
      description: 'Good Pants Black Masculine',
      price: 40,
      sizes: ['M', 'G'],
      stock: 10,
      categoryId: categoryPants.id,
      storeId: store2.id,
      subcategoryId: subcategoryMasculine.id,
      tags: ['Pants', 'Black', 'Masculine'],
      status: 'ATIVO',
    });

    await makeProductImage(productsImagesRepository, {
      productId: product.id,
      is_main: true,
    });

    const page = 1;

    const result = await sut.execute(
      store1.slug,
      page,
      'blouse',
      categoryBlouse.id,
      subcategoryFeminine.id,
    );

    expect(result).toHaveLength(20);
  });

  it('should not allow filtering for a non-existent store.', async () => {
    const page = 1;

    await expect(() =>
      sut.execute('store non-existent', page),
    ).rejects.toBeInstanceOf(NotFoundException);
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

    const result = await sut.execute(store.slug, page);

    expect(result).toHaveLength(0);
  });
});
