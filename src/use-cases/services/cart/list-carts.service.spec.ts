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
import { ListCartsService } from './list-carts.service';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';

describe('List Cart Service', () => {
  let usersRepository: UsersInMemoryRepository;
  let productsRepository: ProductsInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let storesRepository: StoresInMemoryRepository;
  let cartsRepository: CartsInMemoryRepository;
  let cartItemsRepository: CartItemsInMemoryRepository;
  let sut: ListCartsService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    productsRepository = new ProductsInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    cartsRepository = new CartsInMemoryRepository(
      storesRepository,
      cartItemsRepository,
      productsRepository,
    );
    cartItemsRepository = new CartItemsInMemoryRepository();
    sut = new ListCartsService(cartsRepository);
  });

  it('should list the user carts.', async () => {
    const user = await makeUser(usersRepository);

    const store1 = await storesRepository.create({
        name: 'store 1',
        slug: 'store-1',
        whatsapp: makeWhatsapp(),
        status: 'ATIVA'
    })

    const store2 = await storesRepository.create({
        name: 'store 1',
        slug: 'store-1',
        whatsapp: makeWhatsapp(),
        status: 'ATIVA'
    })

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
      storeId: store1.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old-tag'],
    });

    const product2 = await productsRepository.create({
      name: 'product',
      slug: 'product',
      description: 'description',
      price: 10,
      sizes: [],
      stock: 78,
      status: 'ATIVO',
      storeId: store2.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['old'],
    });

    const cart1 = await cartsRepository.create({
      storeId: store1.id,
      userId: user.id,
    });

    makeCartItems(cartItemsRepository, cart1.id, product1.id, 1, 'M');

    const cart2 = await cartsRepository.create({
      storeId: store2.id,
      userId: user.id,
    });

    makeCartItems(cartItemsRepository, cart2.id, product2.id, 1);

    const page = 1;

    const result = await sut.execute(user.id, page);
    
    expect(result.carts).toHaveLength(2)
    expect(result.total).toEqual(2)
  });
});
