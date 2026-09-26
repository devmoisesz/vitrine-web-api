import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { generateKeyPairSync } from 'node:crypto';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { EnvService } from '@/env/env.service';
import { CartsRepository } from '@/database/repositories/carts-repository';
import { CartItemsRepository } from '@/database/repositories/cart-items-repository';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { OrdersRepository } from '@/database/repositories/orders-repository';
import { ListCartProductsService } from '@/use-cases/services/cart/list-cart-products.service';
import { EditSelectedProductService } from '@/use-cases/services/cart/edit-selected-product.service';
import { DeleteItemCartService } from '@/use-cases/services/cart/delete-item-cart.service';
import { RegisterOrderService } from '@/use-cases/services/order/register-order.service';
import { CartsInMemoryRepository } from '../../../../test/in-memory-repository/cart-in-memory-repository';
import { CartItemsInMemoryRepository } from '../../../../test/in-memory-repository/cart-items-in-memory-repository';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { OrdersInMemoryRepository } from '../../../../test/in-memory-repository/order-in-memory-repository';
import { ListCartProductsController } from './list-cart-products.controller';
import { EditSelectedProductController } from './edit-selected-product.controller';
import { DeleteItemCartController } from './delete-item-cart.controller';
import { RegisterOrderController } from './register-order.controller';

const operations = ['list', 'edit', 'delete', 'order'] as const;
type Operation = (typeof operations)[number];

describe('SEG-04 cart ownership (HTTP with real authentication, controllers and services)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const carts = new CartsInMemoryRepository();
  const products = new ProductsInMemoryRepository();
  const items = new CartItemsInMemoryRepository(
    products,
    undefined,
    undefined,
    undefined,
    carts,
  );
  const orders = new OrdersInMemoryRepository();

  beforeAll(async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    jwt = new JwtService({ privateKey, signOptions: { algorithm: 'RS256' } });
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [
        ListCartProductsController,
        EditSelectedProductController,
        DeleteItemCartController,
        RegisterOrderController,
      ],
      providers: [
        JwtStrategy,
        ListCartProductsService,
        EditSelectedProductService,
        DeleteItemCartService,
        RegisterOrderService,
        { provide: CartsRepository, useValue: carts },
        { provide: CartItemsRepository, useValue: items },
        { provide: ProductsRepository, useValue: products },
        { provide: OrdersRepository, useValue: orders },
        {
          provide: EnvService,
          useValue: { get: () => Buffer.from(publicKey).toString('base64') },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    vi.spyOn(items, 'save');
    vi.spyOn(items, 'delete');
    vi.spyOn(items, 'findAllItemsByCart');
    vi.spyOn(products, 'findById');
    vi.spyOn(orders, 'create');
  });

  beforeEach(async () => {
    carts.items = [];
    items.items = [];
    products.items = [];
    products.tags = [];
    products.productTags = [];
    orders.items = [];
    for (const [suffix, userId, storeId] of [
      ['a', 'user-a', 'store-a'],
      ['b', 'user-b', 'store-a'],
      ['c', 'user-b', 'store-b'],
    ]) {
      const cart = await carts.create({ userId, storeId });
      cart.id = `cart-${suffix}`;
      const product = await products.create({
        name: `Product ${suffix}`,
        slug: `product-${suffix}`,
        description: 'Test product',
        price: 10,
        sizes: ['M', 'G'],
        stock: 50,
        status: 'ATIVO',
        storeId,
        categoryId: 'category',
        subcategoryId: 'subcategory',
        tags: [],
      });
      const item = await items.create({
        cartId: cart.id,
        productId: product.id,
        quantity: 2,
        selectedSize: 'M',
      });
      item.id = `item-${suffix}`;
      const otherSize = await items.create({
        cartId: cart.id,
        productId: product.id,
        quantity: 3,
        selectedSize: 'G',
      });
      otherSize.id = `item-${suffix}-g`;
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  function snapshot() {
    return JSON.stringify({
      carts: carts.items,
      items: items.items,
      products: products.items,
      orders: orders.items,
    });
  }

  function perform(
    operation: Operation,
    suffix: string,
    payload: Record<string, unknown> | null = { sub: 'user-a', role: 'USER' },
    body: Record<string, unknown> = { quantity: 4, size: 'M' },
  ) {
    const client = request(app.getHttpServer());
    const call =
      operation === 'list'
        ? client.get(`/cart/cart-${suffix}/products`)
        : operation === 'edit'
          ? client.put(`/cart/item-${suffix}`).send(body)
          : operation === 'delete'
            ? client.delete(`/cart/item-${suffix}`)
            : client.post(`/cart/cart-${suffix}/order`).send(body);
    return payload
      ? call.set('Authorization', `Bearer ${jwt.sign({ ...payload, token_use: 'access' })}`)
      : call;
  }

  function expectNoAccessOrMutation() {
    expect(items.findAllItemsByCart).not.toHaveBeenCalled();
    expect(products.findById).not.toHaveBeenCalled();
    expect(items.save).not.toHaveBeenCalled();
    expect(items.delete).not.toHaveBeenCalled();
    expect(orders.create).not.toHaveBeenCalled();
  }

  describe.each([
    ['user-a', 'b'],
    ['user-a', 'c'],
    ['user-b', 'a'],
  ])(
    '%s cannot access cart/items %s owned by someone else',
    (userId, suffix) => {
      it.each(operations)(
        'rejects %s without reading contents or changing state',
        async (operation) => {
          const before = snapshot();
          await perform(operation, suffix, {
            sub: userId,
            role: 'USER',
          }).expect(404);
          expect(snapshot()).toBe(before);
          expectNoAccessOrMutation();
        },
      );
    },
  );

  it.each(operations)('rejects missing resources for %s', async (operation) => {
    const before = snapshot();
    await perform(operation, 'missing').expect(404);
    expect(snapshot()).toBe(before);
    expectNoAccessOrMutation();
  });

  it.each(operations)('requires authentication for %s', async (operation) => {
    await perform(operation, 'a', null).expect(401);
    expectNoAccessOrMutation();
  });

  describe.each([undefined, '', '   ', 123])(
    'invalid JWT subject %j',
    (sub) => {
      it.each(operations)(
        'rejects %s before accessing cart data',
        async (operation) => {
          await perform(operation, 'a', { sub, role: 'USER' }).expect(401);
          expectNoAccessOrMutation();
        },
      );
    },
  );

  it.each(operations)(
    'does not let an admin use another user cart for %s',
    async (operation) => {
      await perform(operation, 'b', { sub: 'user-a', role: 'ADMIN' }).expect(
        404,
      );
      expectNoAccessOrMutation();
    },
  );

  describe.each([
    ['user-a', 'a'],
    ['user-b', 'b'],
  ])('%s can use own cart %s', (userId, suffix) => {
    it.each(operations)(
      'allows %s and preserves other carts',
      async (operation) => {
        const others = JSON.stringify(
          items.items.filter((item) => item.cartId !== `cart-${suffix}`),
        );
        const response = await perform(operation, suffix, {
          sub: userId,
          role: 'USER',
        }).expect(
          operation === 'list' ? 200 : operation === 'order' ? 201 : 204,
        );
        if (operation === 'list') {
          expect(response.body).toHaveLength(2);
          expect(
            response.body.every(
              (item: { cartId: string }) => item.cartId === `cart-${suffix}`,
            ),
          ).toBe(true);
        }
        if (operation === 'edit')
          expect((await items.findById(`item-${suffix}`))?.quantity).toBe(4);
        if (operation === 'delete')
          expect(await items.findById(`item-${suffix}`)).toBeNull();
        if (operation === 'order') {
          expect(orders.items).toHaveLength(1);
          expect(orders.items[0]).toMatchObject({ userId, storeId: 'store-a' });
          expect(Number(orders.items[0].total)).toBe(50);
          expect(orders.items[0].order_items).toHaveLength(2);
        }
        expect(
          JSON.stringify(
            items.items.filter((item) => item.cartId !== `cart-${suffix}`),
          ),
        ).toBe(others);
      },
    );
  });

  it('merges sizes only within the authenticated user cart', async () => {
    const others = JSON.stringify(
      items.items.filter((item) => item.cartId !== 'cart-a'),
    );
    await perform(
      'edit',
      'a',
      { sub: 'user-a', role: 'USER' },
      { quantity: 4, size: 'G' },
    ).expect(204);
    expect(await items.findById('item-a')).toBeNull();
    expect((await items.findById('item-a-g'))?.quantity).toBe(7);
    expect(
      JSON.stringify(items.items.filter((item) => item.cartId !== 'cart-a')),
    ).toBe(others);
  });

  it.each(['edit', 'order'] as const)(
    'ignores forged user/cart identifiers in the body for %s',
    async (operation) => {
      const before = snapshot();
      await perform(
        operation,
        'b',
        { sub: 'user-a', role: 'USER' },
        {
          quantity: 4,
          size: 'G',
          userId: 'user-b',
          cartId: 'cart-a',
          sub: 'user-b',
        },
      ).expect(404);
      expect(snapshot()).toBe(before);
      expectNoAccessOrMutation();
    },
  );

  it.each(['edit', 'delete'] as const)(
    'rejects an orphan item for %s',
    async (operation) => {
      carts.items = carts.items.filter((cart) => cart.id !== 'cart-a');
      await perform(operation, 'a').expect(404);
      expectNoAccessOrMutation();
    },
  );

  it('authorizes an empty cart before checking if it can create an order', async () => {
    items.items = [];
    await perform('order', 'b').expect(404);
    expectNoAccessOrMutation();
    await perform('order', 'a').expect(400);
    expect(orders.create).not.toHaveBeenCalled();
  });
});
