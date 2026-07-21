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
import { ListProductsService } from './list-products.service';

describe('List Products Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let productsImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let sut: ListProductsService;

  beforeEach(() => {
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository(
      storesRepository,
      productsImagesRepository,
    );
    sut = new ListProductsService(productsRepository);
  });

  it('should return only the filtered requests', async () => {
    const store = await makeStore(storesRepository);

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
        storeId: store.id,
        subcategoryId: subcategoryFeminine.id,
        tags: ['Blouse', 'Black', 'Feminine'],
        status: 'ATIVO',
      });

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: product[0] ? true : false
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
      storeId: store.id,
      subcategoryId: subcategoryMasculine.id,
      tags: ['Pants', 'Black', 'Masculine'],
      status: 'ATIVO',
    });

    await makeProductImage(productsImagesRepository, {
      productId: product.id,
      is_main: true
    });

    const page = 1;

    const result = await sut.execute(
      page,
      'pants',
      categoryPants.id,
      subcategoryMasculine.id,
    );
    
    expect(result).toHaveLength(1);
  });

  it('should return the products from page 1', async () => {
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

    const page = 1;

    const result = await sut.execute(page);

    expect(result).toHaveLength(40);
  });

  it('should return only the products matching the search.', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for (let i = 0; i < 20; i++) {
      const product = await productsRepository.create({
        name: 'black shirt',
        description: 'black',
        price: 60,
        sizes: ['P', 'M'],
        categoryId: category.id,
        subcategoryId: subcategory.id,
        slug: 'black-shirt',
        stock: 100,
        storeId: store.id,
        tags: ['black'],
        status: 'ATIVO',
      });

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: true,
      });
    }

    for (let i = 0; i < 19; i++) {
      const product = await productsRepository.create({
        name: 'white shirt',
        description: 'white',
        price: 60,
        sizes: ['P', 'M'],
        categoryId: category.id,
        subcategoryId: subcategory.id,
        slug: 'white-shirt',
        stock: 100,
        storeId: store.id,
        tags: ['white'],
        status: 'ATIVO',
      });

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: true,
      });
    }

    const page = 1;

    const result = await sut.execute(page, 'blac');

    expect(result).toHaveLength(20);
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

    const result = await sut.execute(page);

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

    const result = await sut.execute(page);

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

    const result = await sut.execute(page);

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

    const result = await sut.execute(page);

    expect(result).toHaveLength(15);
  });
});
