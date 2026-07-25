import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { CartsInMemoryRepository } from '../../../../test/in-memory-repository/cart-in-memory-repository';
import { CartItemsInMemoryRepository } from '../../../../test/in-memory-repository/cart-items-in-memory-repository';
import { makeUser } from '../../../../test/factories/make-user';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { makeCartItems } from '../../../../test/factories/make-cart-items';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { ListCartProductsService } from './list-cart-products.service';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import { NotFoundException } from '@nestjs/common';
import { makeProductImage } from '../../../../test/factories/make-product-image';

describe('List Cart Products Service', () => {
  let usersRepository: UsersInMemoryRepository;
  let productsRepository: ProductsInMemoryRepository;
  let productImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let cartsRepository: CartsInMemoryRepository;
  let cartItemsRepository: CartItemsInMemoryRepository;
  let sut: ListCartProductsService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository();
    productImagesRepository = new ProductsImagesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    cartsRepository = new CartsInMemoryRepository(
      storesRepository,
      cartItemsRepository,
      productsRepository,
    );
    cartItemsRepository = new CartItemsInMemoryRepository(
      productsRepository,
      productImagesRepository,
      categoriesRepository,
      subcategoriesRepository,
    );
    sut = new ListCartProductsService(cartsRepository, cartItemsRepository);
  });

  it('should be possible to see the products inside the cart.', async () => {
    const user = await makeUser(usersRepository);

    const store = await storesRepository.create({
      name: 'store 1',
      slug: 'store-1',
      whatsapp: makeWhatsapp(),
      status: 'ATIVA',
    });

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    const product1 = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 100,
      sizes: ['P', 'M', 'G'],
      stock: 128,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await makeProductImage(productImagesRepository, {
        is_main: true,
        productId: product1.id
    })

    const product2 = await productsRepository.create({
      name: 'product',
      slug: 'product',
      description: 'description',
      price: 50,
      sizes: [],
      stock: 20,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['tag'],
    });

    await makeProductImage(productImagesRepository, {
        is_main: true,
        productId: product2.id
    })

    const cart = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    makeCartItems(cartItemsRepository, cart.id, product1.id, 10, 'M');
    makeCartItems(cartItemsRepository, cart.id, product2.id, 5);

    const result = await sut.execute(cart.id);

    expect(result).toHaveLength(2);
  });

  it('should not be possible to view the products inside a non-existent cart.', async () => {
    const store = await storesRepository.create({
      name: 'store 1',
      slug: 'store-1',
      whatsapp: makeWhatsapp(),
      status: 'ATIVA',
    });

    const category = await makeCategory(categoriesRepository);

    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 100,
      sizes: ['P', 'M', 'G'],
      stock: 128,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await expect(() => 
        sut.execute('not exists cart')
    ).rejects.toBeInstanceOf(NotFoundException)
  });
});
