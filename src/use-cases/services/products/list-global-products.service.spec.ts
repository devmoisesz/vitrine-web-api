import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { makeStore } from '../../../../test/factories/make-store';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { ListGlobalProductsService } from './list-global-products.service';
import { makeProducts } from '../../../../test/factories/make-product';
import { makeProductImage } from '../../../../test/factories/make-product-image';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';

describe('List Global Products Service', () => {
  let productsRepository: ProductsInMemoryRepository;
  let productsImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let sut: ListGlobalProductsService;

  beforeEach(() => {
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository(storesRepository, productsImagesRepository);
    sut = new ListGlobalProductsService(
      productsRepository,
    );
  });

  it('should return the products from page 1', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for(let i = 0; i < 50; i++){
      const product = await makeProducts(productsRepository, store.id, category.id, subcategory.id, 'ATIVO')
      await makeProductImage(productsImagesRepository, {
        productId: product.id
      })
    }

    const page = 1

    const result = await sut.execute(page);

    expect(result).toHaveLength(40)
  });

  it('should return only the products matching the search.', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for(let i = 0; i < 20; i++){
      const product = await productsRepository.create({
        name: 'black shirt',
        description: 'black',
        price: 60,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        slug: 'black-shirt',
        stock: 100,
        storeId: store.id,
        tags: ['black'],
        status: 'ATIVO'
      })

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: true
      })
    }

    for(let i = 0; i < 19; i++){
      const product = await productsRepository.create({
        name: 'white shirt',
        description: 'white',
        price: 60,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        slug: 'white-shirt',
        stock: 100,
        storeId: store.id,
        tags: ['white'],
        status: 'ATIVO'
      })

      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: true
      })
    }

    const page = 1

    const result = await sut.execute(page, 'blac');

    expect(result).toHaveLength(20)
  });

  it('should return the products from page 2', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for(let i = 0; i < 50; i++){
      const product = await makeProducts(productsRepository, store.id, category.id, subcategory.id, 'ATIVO')
      await makeProductImage(productsImagesRepository, {
        productId: product.id
      })
    }

    const page = 2

    const result = await sut.execute(page);

    expect(result).toHaveLength(10)
  });

  it('should return an empty list because the product stores are inactive.', async () => {
    const store = await makeStore(storesRepository, undefined, 'INATIVA');

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for(let i = 0; i < 10; i++){
      const product = await makeProducts(productsRepository, store.id, category.id, subcategory.id, 'ATIVO')
      await makeProductImage(productsImagesRepository, {
        productId: product.id
      })
    }

    const page = 1

    const result = await sut.execute(page);

    expect(result).toHaveLength(0)
  });
  
  it('should return an empty list because all the products are empty.', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for(let i = 0; i < 50; i++){
      const product = await makeProducts(productsRepository, store.id, category.id, subcategory.id)
      await makeProductImage(productsImagesRepository, {
        productId: product.id
      })
    }

    const page = 1

    const result = await sut.execute(page);

    expect(result).toHaveLength(0)
  });

  it('should return only the active products', async () => {
    const store = await makeStore(storesRepository);

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for(let i = 0; i < 15; i++){
      const product = await makeProducts(productsRepository, store.id, category.id, subcategory.id)
      await makeProductImage(productsImagesRepository, {
        productId: product.id
      })
    }

    for(let i = 0; i < 15; i++){
      const product = await makeProducts(productsRepository, store.id, category.id, subcategory.id, 'ATIVO')
      await makeProductImage(productsImagesRepository, {
        productId: product.id
      })
    }

    const page = 1

    const result = await sut.execute(page);

    expect(result).toHaveLength(15)
  });
});
