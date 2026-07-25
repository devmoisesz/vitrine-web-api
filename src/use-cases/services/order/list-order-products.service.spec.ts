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
import { OrdersInMemoryRepository } from '../../../../test/in-memory-repository/order-in-memory-repository';
import { ListOrderProductsService } from './list-order-products.service';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import { makeProductImage } from '../../../../test/factories/make-product-image';

describe('List Order Product Service', () => {
  let usersRepository: UsersInMemoryRepository;
  let productsRepository: ProductsInMemoryRepository;
  let productImagesRepository: ProductsImagesInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let cartsRepository: CartsInMemoryRepository;
  let cartItemsRepository: CartItemsInMemoryRepository;
  let ordersRepository: OrdersInMemoryRepository;
  let sut: ListOrderProductsService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository();
    productImagesRepository = new ProductsImagesInMemoryRepository()
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
    sut = new ListOrderProductsService(ordersRepository);
  });

  it('should list the user carts.', async () => {
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

    await makeProductImage(productImagesRepository, {
        is_main: true,
        productId: product1.id
    })

    const product2 = await productsRepository.create({
      name: 'product',
      slug: 'product',
      description: 'description',
      price: 10,
      sizes: ['G'],
      stock: 128,
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

    const cart1 = await cartsRepository.create({
      storeId: store.id,
      userId: user.id,
    });

    const item1 = await makeCartItems(
      cartItemsRepository,
      cart1.id,
      product1.id,
      4,
      'M',
    );
    const item2 = await makeCartItems(
      cartItemsRepository,
      cart1.id,
      product2.id,
      5,
      'G',
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

    const order = await ordersRepository.create({
      storeId: store.id,
      userId: user.id,
      total,
      items,
    });

    const page = 1;

    const result = await sut.execute(order.id, page);
    
    expect(result.order_items).toHaveLength(2);
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        userId: user.id,
        order_items: expect.any(Array),
      }),
    );
  });
});
