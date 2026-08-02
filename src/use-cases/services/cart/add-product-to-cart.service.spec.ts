import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { makeStore } from '../../../../test/factories/make-store';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AddProductToCartService } from './add-product-to-cart.service';
import { CartsInMemoryRepository } from '../../../../test/in-memory-repository/cart-in-memory-repository';
import { CartItemsInMemoryRepository } from '../../../../test/in-memory-repository/cart-items-in-memory-repository';
import { makeUser } from '../../../../test/factories/make-user';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { makeCartItems } from '../../../../test/factories/make-cart-items';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';

describe('Add Product To Cart Service', () => {
  let usersRepository: UsersInMemoryRepository;
  let productsRepository: ProductsInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let cartsRepository: CartsInMemoryRepository;
  let cartItemsRepository: CartItemsInMemoryRepository;
  let sut: AddProductToCartService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    cartsRepository = new CartsInMemoryRepository();
    cartItemsRepository = new CartItemsInMemoryRepository();
    sut = new AddProductToCartService(
      productsRepository,
      storesRepository,
      cartsRepository,
      cartItemsRepository,
    );
  });

  it('should be possible to add a product to a new cart.', async () => {
    const user = await makeUser(usersRepository);

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
      sizes: ['P', 'M', 'G'],
      stock: 128,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await sut.execute(user.id, product.id, 5, 'P');

    const cart = cartsRepository.items.find(
      (item) => item.userId === user.id && item.storeId === store.id,
    );

    const cartItems = cartItemsRepository.items.find(
      (item) => item.cartId === cart?.id,
    );

    expect(cart?.storeId).toEqual(store.id);
    expect(cartItems?.productId).toEqual(product.id);
  });

  it('should be possible to add a product without a size.', async () => {
    const user = await makeUser(usersRepository);

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
      sizes: [],
      stock: 128,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await sut.execute(user.id, product.id, 5);

    const cart = cartsRepository.items.find(
      (item) => item.userId === user.id && item.storeId === store.id,
    );

    const cartItems = cartItemsRepository.items.find(
      (item) => item.cartId === cart?.id,
    );

    expect(cart?.storeId).toEqual(store.id);
    expect(cartItems?.productId).toEqual(product.id);
  });

  it('should be possible to add a product to an existing cart.', async () => {
    const user = await makeUser(usersRepository);

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
      sizes: ['P', 'M', 'G'],
      stock: 128,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    const cart = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    await makeCartItems(cartItemsRepository, cart.id, product.id, 5, 'P');

    await sut.execute(user.id, product.id, 5, 'P');

    const cartDatabase = cartsRepository.items.find(
      (item) => item.userId === user.id && item.storeId === store.id,
    );

    const cartItemsDatabase = cartItemsRepository.items.find(
      (item) => item.cartId === cartDatabase?.id,
    );

    expect(cartDatabase?.storeId).toEqual(store.id);
    expect(cartItemsDatabase?.productId).toEqual(product.id);
    expect(cartItemsDatabase?.quantity).toEqual(10);
  });

  it('should not be possible to add a product without a size by sending a size.', async () => {
    const user = await makeUser(usersRepository);

    const store = await storesRepository.create({
      name: 'Store Feminine',
      slug: 'store-Feminine',
      whatsapp: makeWhatsapp(),
      description: 'Good Store Femine',
      status: 'ATIVA'
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
      price: 10,
      sizes: [],
      stock: 10,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    await expect(() =>
      sut.execute(user.id, product.id, 1, 'M'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not allow adding an inactive product.', async () => {
    const user = await makeUser(usersRepository);

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
      sizes: ['P', 'M'],
      stock: 10,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await expect(() =>
      sut.execute(user.id, product.id, 1, 'M'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  
  it('must not allow selecting a product from an inactive store', async () => {
    const user = await makeUser(usersRepository);

    const store = await storesRepository.create({
      name: 'Store Feminine',
      slug: 'store-Feminine',
      whatsapp: makeWhatsapp(),
      description: 'Good Store Femine',
      status: 'INATIVA'
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
      price: 10,
      sizes: ['P', 'M'],
      stock: 10,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    const cart = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    await makeCartItems(cartItemsRepository, cart.id, product.id, 5, 'P');

    await expect(() =>
      sut.execute(user.id, product.id, 1, 'M'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should not allow adding an inactive product.', async () => {
    const user = await makeUser(usersRepository);

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
      sizes: ['P', 'M'],
      stock: 10,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    await expect(() =>
      sut.execute(user.id, product.id, 1, 'M'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should not allow adding a product with zero stock.', async () => {
    const user = await makeUser(usersRepository);

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
      sizes: ['P', 'M'],
      stock: 0,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: firstCategory.id,
      subcategoryId: firstSubcategory.id,
      tags: ['old-tag'],
    });

    await expect(() =>
      sut.execute(user.id, product.id, 2),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('must not allow selecting a quantity greater than the stock.', async () => {
    const user = await makeUser(usersRepository);

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
      sizes: ['P', 'M'],
      stock: 2,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: firstCategory.id,
      subcategoryId: firstSubcategory.id,
      tags: ['old-tag'],
    });

    const cart = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    await makeCartItems(cartItemsRepository, cart.id, product.id, 5, 'P');

    await expect(() =>
      sut.execute(user.id, product.id, 3, 'P'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
