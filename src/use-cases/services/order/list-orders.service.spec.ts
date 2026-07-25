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
import { ListOrdersService } from './list-orders.service';
import { OrdersInMemoryRepository } from '../../../../test/in-memory-repository/order-in-memory-repository';

describe('List Orders Service', () => {
  let usersRepository: UsersInMemoryRepository;
  let productsRepository: ProductsInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let cartsRepository: CartsInMemoryRepository;
  let cartItemsRepository: CartItemsInMemoryRepository;
  let ordersRepository: OrdersInMemoryRepository;
  let sut: ListOrdersService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    ordersRepository = new OrdersInMemoryRepository();
    cartsRepository = new CartsInMemoryRepository(
      storesRepository,
      cartItemsRepository,
      productsRepository,
    );
    cartItemsRepository = new CartItemsInMemoryRepository();
    sut = new ListOrdersService(ordersRepository);
  });

  it('must list the user orders', async () => {
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
      price: 10,
      sizes: ['P', 'M', 'G'],
      stock: 128,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    const product2 = await productsRepository.create({
      name: 'product',
      slug: 'product',
      description: 'description',
      price: 10,
      sizes: ["G"],
      stock: 128,
      status: 'ATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['tag'],
    });

    const cart1 = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    const item1 = await makeCartItems(
      cartItemsRepository,
      cart1.id,
      product1.id,
      10,
      'M',
    );
    const item2 = await makeCartItems(
      cartItemsRepository,
      cart1.id,
      product2.id,
      1,
      "G"
    );

    const items = [
      {
        productId: item1.productId,
        productName: product1.name,
        quantity: item1.quantity,
        price: product1.price,
        selectedSize: item1.selectedSize,
      },
      {
        productId: item2.productId,
        productName: product2.name,
        quantity: item2.quantity,
        price: product2.price,
        selectedSize: item2.selectedSize,
      },
    ];

    const total = 20 * 2;

    await ordersRepository.create({
      storeId: store.id,
      userId: user.id,
      total,
      items,
    });

    const page = 1;

    const result = await sut.execute(user.id, page);
    
    expect(result).toHaveLength(1);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
            storeId: store.id,
            userId: user.id,
        })
    ]));
  });
});
