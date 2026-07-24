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
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { makeProductImage } from '../../../../test/factories/make-product-image';
import { EditSelectedProductService } from './edit-selected-product.service';

describe('List Cart Products Service', () => {
  let usersRepository: UsersInMemoryRepository;
  let productsRepository: ProductsInMemoryRepository;
  let productImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let cartsRepository: CartsInMemoryRepository;
  let cartItemsRepository: CartItemsInMemoryRepository;
  let sut: EditSelectedProductService;

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
    sut = new EditSelectedProductService(
      cartItemsRepository,
      productsRepository,
    );
  });

  it('should be possible to edit a product already selected in the cart.', async () => {
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

    const cartItem = await makeCartItems(
      cartItemsRepository,
      cart.id,
      product1.id,
      10,
      'M',
    );

    await makeCartItems(cartItemsRepository, cart.id, product2.id, 5);

    await sut.execute(cartItem.id, 5, 'G');

    (expect(cartItemsRepository.items[0].quantity).toEqual(5),
      expect(cartItemsRepository.items[0].selectedSize).toEqual('G'));
  });

  it('should be possible to edit an item in the cart; if an item matching the change already exists, simply increase the quantity.', async () => {
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
      productId: product.id,
    });

    const cart = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    const cartItem = await makeCartItems(
      cartItemsRepository,
      cart.id,
      product.id,
      10,
      'M',
    );

    expect(cartItemsRepository.items[0].selectedSize).toEqual('M');

    await makeCartItems(cartItemsRepository, cart.id, product.id, 1, 'G');

    await sut.execute(cartItem.id, 2, 'G');

    expect(cartItemsRepository.items[0].quantity).toEqual(3);
    expect(cartItemsRepository.items[0].selectedSize).toEqual('G');
  });

  it('should not be possible to edit an item that does not exist.', async () => {
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
      sut.execute('not exists cartItems', 8, 'M'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should be possible to edit an items size by submitting a size that doesnt exist.', async () => {
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

    const cartItem1 = await makeCartItems(
      cartItemsRepository,
      cart.id,
      product.id,
      10,
      'M',
    );

    await expect(() =>
      sut.execute(cartItem1.id, undefined, 'P'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be possible to increase the quantity of an item to a number greater than the stock level.', async () => {
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
      sizes: [],
      stock: 2,
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

    const cartItem1 = await makeCartItems(
      cartItemsRepository,
      cart.id,
      product.id,
      1,
      'M',
    );

    await expect(() => sut.execute(cartItem1.id, 3)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
