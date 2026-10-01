import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'node:crypto';
import type { PrismaService } from '../prisma.service';
import { PrismaOrdersRepository } from './prisma-order-repository';

describe('Atomic checkout (PostgreSQL)', () => {
  let prisma: PrismaClient;
  let repository: PrismaOrdersRepository;

  beforeAll(async () => {
    const connectionString = process.env.DATABASE_URL!;
    const schema = new URL(connectionString).searchParams.get('schema')!;
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }, { schema }),
    });
    repository = new PrismaOrdersRepository(prisma as unknown as PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  async function setupCart() {
    const unique = randomUUID();
    const user = await prisma.user.create({
      data: { name: 'Customer', email: `${unique}@example.com` },
    });
    const store = await prisma.store.create({
      data: { name: 'Store', slug: unique, whatsapp: unique },
    });
    const category = await prisma.category.create({
      data: { name: unique, slug: unique },
    });
    const subcategory = await prisma.subCategory.create({
      data: { name: unique, slug: unique, categoryId: category.id },
    });
    const product = await prisma.product.create({
      data: {
        name: 'Product',
        slug: unique,
        description: 'Product',
        price: 10,
        stock: 5,
        storeId: store.id,
        categoryId: category.id,
        subcategoryId: subcategory.id,
      },
    });
    const cart = await prisma.cart.create({
      data: {
        userId: user.id,
        storeId: store.id,
        cart_items: { create: { productId: product.id, quantity: 2 } },
      },
    });
    const order = {
      userId: user.id,
      storeId: store.id,
      total: 20,
      items: [
        { productId: product.id, quantity: 2, price: 10, selectedSize: null },
      ],
    };
    return { cart, order, product };
  }

  it('creates one order, removes cart and items, and rejects repeated checkout', async () => {
    const { cart, order, product } = await setupCart();
    expect(await repository.createFromCart(cart.id, order)).not.toBeNull();
    expect(await repository.createFromCart(cart.id, order)).toBeNull();
    expect(await prisma.order.count({ where: { userId: order.userId } })).toBe(
      1,
    );
    expect(await prisma.cart.findUnique({ where: { id: cart.id } })).toBeNull();
    expect(await prisma.cartItems.count({ where: { cartId: cart.id } })).toBe(
      0,
    );
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
        .stock,
    ).toBe(5);
    // The user can start a fresh cart for the same store after checkout.
    expect(
      (
        await prisma.cart.create({
          data: { userId: order.userId, storeId: order.storeId },
        })
      ).id,
    ).not.toBe(cart.id);
  });

  it('allows only one of two concurrent checkouts to create an order', async () => {
    const { cart, order } = await setupCart();
    const results = await Promise.all([
      repository.createFromCart(cart.id, order),
      repository.createFromCart(cart.id, order),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await prisma.order.count({ where: { userId: order.userId } })).toBe(
      1,
    );
    expect(await prisma.cartItems.count({ where: { cartId: cart.id } })).toBe(
      0,
    );
  });

  it('rolls back cart deletion and all order writes if item persistence fails', async () => {
    const { cart, order } = await setupCart();
    await expect(
      repository.createFromCart(cart.id, {
        ...order,
        items: [...order.items, { ...order.items[0], productId: randomUUID() }],
      }),
    ).rejects.toThrow();
    expect(
      await prisma.cart.findUnique({ where: { id: cart.id } }),
    ).not.toBeNull();
    expect(await prisma.cartItems.count({ where: { cartId: cart.id } })).toBe(
      1,
    );
    expect(await prisma.order.count({ where: { userId: order.userId } })).toBe(
      0,
    );
    expect(await repository.createFromCart(cart.id, order)).not.toBeNull();
  });

  it('cannot consume a cart for a different user or store', async () => {
    const { cart, order } = await setupCart();
    expect(
      await repository.createFromCart(cart.id, {
        ...order,
        userId: randomUUID(),
      }),
    ).toBeNull();
    expect(
      await repository.createFromCart(cart.id, {
        ...order,
        storeId: randomUUID(),
      }),
    ).toBeNull();
    expect(
      await prisma.cart.findUnique({ where: { id: cart.id } }),
    ).not.toBeNull();
    expect(await prisma.order.count({ where: { userId: order.userId } })).toBe(
      0,
    );
  });
});
