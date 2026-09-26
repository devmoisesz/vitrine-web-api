import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.service';
import { PrismaCartsRepository } from './prisma-carts-repository';
import { PrismaCartItemsRepository } from './prisma-cart-items-repository';

describe('Cart ownership database filters', () => {
  const prisma = {
    cart: { findFirst: vi.fn() },
    cartItems: { findFirst: vi.fn() },
  };
  const carts = new PrismaCartsRepository(prisma as unknown as PrismaService);
  const items = new PrismaCartItemsRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => vi.resetAllMocks());

  it('requires the cart id and authenticated owner in the same query', async () => {
    prisma.cart.findFirst.mockResolvedValue(null);
    await expect(
      carts.findByIdAndUserId('cart-a', 'user-a'),
    ).resolves.toBeNull();
    expect(prisma.cart.findFirst).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'cart-a', userId: 'user-a' },
    });
  });

  it('requires the item id and its parent cart owner in the same query', async () => {
    prisma.cartItems.findFirst.mockResolvedValue(null);
    await expect(
      items.findByIdAndUserId('item-a', 'user-a'),
    ).resolves.toBeNull();
    expect(prisma.cartItems.findFirst).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'item-a', cart: { userId: 'user-a' } },
    });
  });

  it.each([
    ['', 'user-a'],
    ['id', ''],
    [undefined, 'user-a'],
    ['id', undefined],
  ])(
    'never omits an identifier from either lookup: %s, %s',
    async (id, userId) => {
      await expect(
        carts.findByIdAndUserId(id as string, userId as string),
      ).resolves.toBeNull();
      await expect(
        items.findByIdAndUserId(id as string, userId as string),
      ).resolves.toBeNull();
      expect(prisma.cart.findFirst).not.toHaveBeenCalled();
      expect(prisma.cartItems.findFirst).not.toHaveBeenCalled();
    },
  );
});
