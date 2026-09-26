import type { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
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
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { ListStoresService } from '@/use-cases/services/stores/list-stores.service';
import { ListStoreHomeService } from '@/use-cases/services/stores/list-store-home.service';
import { ListStoresController } from './list-stores.controller';
import { ListStoreHomeController } from './list-store-home.controller';

describe('SEG-05 public store responses (HTTP integration)', () => {
  let app: INestApplication;
  const date = new Date('2026-01-01T00:00:00.000Z');
  const publicStore = {
    id: 'store-a',
    name: 'Loja A',
    slug: 'loja-a',
    description: 'Roupas',
    logo_image_url: 'https://example.com/logo.png',
    bannerUrl: 'https://example.com/banner.png',
  };
  const image = {
    id: 'image-a',
    image_url: 'https://example.com/product.png',
    is_main: true,
  };
  const publicProduct = {
    id: 'product-a',
    name: 'Camisa',
    slug: 'camisa',
    description: 'Camisa de algodão',
    price: '69.79',
    sizes: ['M', 'G'],
    stock: 10,
    status: 'ATIVO',
    storeId: 'store-a',
    categoryId: 'category-a',
    subcategoryId: 'subcategory-a',
    createdAt: date.toISOString(),
    products_images: [image],
  };
  const rawStore = {
    ...publicStore,
    cpf: 'private-cpf',
    cnpj: 'private-cnpj',
    email: 'private@example.com',
    whatsapp: 'private-whatsapp',
    status: 'ATIVA',
    createdAt: date,
    logoPublicId: 'private-logo-id',
    bannerPublicId: 'private-banner-id',
    payment_methods: ['PIX'],
    delivery_methods: ['RETIRADA_LOJA'],
    futurePrivateField: 'private-future-field',
    collaborators: [{ userId: 'private-user-id' }],
    products: [
      {
        ...publicProduct,
        price: new Prisma.Decimal('69.79'),
        createdAt: date,
        futurePrivateField: 'private-product-field',
        store: { cpf: 'private-nested-cpf' },
        products_images: [
          {
            ...image,
            storage_public_id: 'private-image-id',
            productId: 'product-a',
            createdAt: date,
            futurePrivateField: 'private-image-field',
          },
        ],
      },
    ],
  };
  const repository = { findMany: vi.fn(), findManyWithProducts: vi.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ListStoresController, ListStoreHomeController],
      providers: [
        ListStoresService,
        ListStoreHomeService,
        { provide: StoresRepository, useValue: repository },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    repository.findMany.mockResolvedValue({ stores: [rawStore], total: 23 });
    repository.findManyWithProducts.mockResolvedValue({
      stores: [rawStore],
      total: 23,
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each(['/stores', '/home/stores'])(
    '%s exposes only explicitly allowed fields without authentication',
    async (path) => {
      const before = JSON.stringify(rawStore);
      const response = await request(app.getHttpServer()).get(path).expect(200);
      expect(response.headers['x-total-count']).toBe('23');
      expect(response.body).toEqual([
        path === '/stores'
          ? publicStore
          : { ...publicStore, products: [publicProduct] },
      ]);
      expect(response.text).not.toContain('private-');
      expect(JSON.stringify(rawStore)).toBe(before);
    },
  );

  it.each(['/stores', '/home/stores'])(
    '%s preserves ordering, filters and pagination metadata',
    async (path) => {
      const secondStore = {
        ...rawStore,
        id: 'store-b',
        name: 'Loja B',
        slug: 'loja-b',
      };
      const lookup =
        path === '/stores'
          ? repository.findMany
          : repository.findManyWithProducts;
      lookup.mockResolvedValue({ stores: [secondStore, rawStore], total: 42 });
      const response = await request(app.getHttpServer())
        .get(path)
        .query({ name: 'Loja', page: 2 })
        .expect(200);
      expect(lookup).toHaveBeenCalledExactlyOnceWith('2', 'Loja');
      expect(response.body.map((store: { id: string }) => store.id)).toEqual([
        'store-b',
        'store-a',
      ]);
      expect(response.headers['x-total-count']).toBe('42');
    },
  );

  it.each(['/stores', '/home/stores'])(
    '%s preserves null public images and descriptions',
    async (path) => {
      const lookup =
        path === '/stores'
          ? repository.findMany
          : repository.findManyWithProducts;
      lookup.mockResolvedValue({
        stores: [
          {
            ...rawStore,
            description: null,
            logo_image_url: null,
            bannerUrl: null,
            products: [],
          },
        ],
        total: 1,
      });
      const response = await request(app.getHttpServer()).get(path).expect(200);
      expect(response.body).toEqual([
        {
          ...publicStore,
          description: null,
          logo_image_url: null,
          bannerUrl: null,
          ...(path === '/home/stores' ? { products: [] } : {}),
        },
      ]);
    },
  );

  it.each(['/stores', '/home/stores'])(
    '%s returns an empty list and zero total when there are no results',
    async (path) => {
      const lookup =
        path === '/stores'
          ? repository.findMany
          : repository.findManyWithProducts;
      lookup.mockResolvedValue({ stores: [], total: 0 });
      const response = await request(app.getHttpServer()).get(path).expect(200);
      expect(response.body).toEqual([]);
      expect(response.headers['x-total-count']).toBe('0');
    },
  );

  it('returns products with an empty images list when there are no images', async () => {
    repository.findManyWithProducts.mockResolvedValue({
      stores: [
        {
          ...rawStore,
          products: [{ ...rawStore.products[0], products_images: [] }],
        },
      ],
      total: 1,
    });
    const response = await request(app.getHttpServer())
      .get('/home/stores')
      .expect(200);
    expect(response.body).toEqual([
      { ...publicStore, products: [{ ...publicProduct, products_images: [] }] },
    ]);
  });
});
