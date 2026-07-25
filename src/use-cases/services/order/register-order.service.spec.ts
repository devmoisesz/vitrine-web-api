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
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import {
    BadRequestException
} from '@nestjs/common';
import { makeProductImage } from '../../../../test/factories/make-product-image';
import { RegisterOrderService } from './register-order.service';
import { OrdersInMemoryRepository } from '../../../../test/in-memory-repository/order-in-memory-repository';

describe('Register Order Service', () => {
  let usersRepository: UsersInMemoryRepository;
  let productsRepository: ProductsInMemoryRepository;
  let productImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let cartsRepository: CartsInMemoryRepository;
  let ordersRepository: OrdersInMemoryRepository;
  let cartItemsRepository: CartItemsInMemoryRepository;
  let sut: RegisterOrderService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository();
    productImagesRepository = new ProductsImagesInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    ordersRepository = new OrdersInMemoryRepository()
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
    sut = new RegisterOrderService(
      ordersRepository,
      cartsRepository,
      cartItemsRepository,
      productsRepository,
    );
  });

  it('should be possible to place an order.', async () => {
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
      productId: product1.id,
    });

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
      productId: product2.id,
    });

    const cart = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    await makeCartItems(
      cartItemsRepository,
      cart.id,
      product1.id,
      10,
      'M',
    );

    await makeCartItems(cartItemsRepository, cart.id, product2.id, 5);

    await sut.execute(cart.id);

    expect(ordersRepository.items).toHaveLength(1)
    expect(ordersRepository.items[0].storeId).toEqual(store.id)
    expect(ordersRepository.items[0].userId).toEqual(user.id)
  });

  it('should not be possible to place an order for a cart with no items.', async () => {
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

    const product = await productsRepository.create({
      name: 'old product',
      slug: 'old-product',
      description: 'old description',
      price: 100,
      sizes: ['M', 'G'],
      stock: 128,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await makeProductImage(productImagesRepository, {
      is_main: true,
      productId: product.id,
    });

    const cart = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    await expect(() =>
      sut.execute(cart.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
