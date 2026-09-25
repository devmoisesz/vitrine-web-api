import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
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
import { PrismaService } from '@/database/prisma/prisma.service';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { CategoriesRepository } from '@/database/repositories/categories-repository';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';
import { EnvService } from '@/env/env.service';
import { StorageService } from '@/storage/storage.service';
import { DeleteProductService } from '@/use-cases/services/products/delete-product.service';
import { EditProductService } from '@/use-cases/services/products/edit-product.service';
import { UpdateStatusProductService } from '@/use-cases/services/products/update-status-product.service';
import { UploadProductImagesService } from '@/use-cases/services/products/upload-product-image.service';
import { ChangeProductImageService } from '@/use-cases/services/products/change-product-image.service';
import { DeleteProductImageService } from '@/use-cases/services/products/delete-product-image.service';
import { SetMainImageService } from '@/use-cases/services/products/set-main-image.service';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { StorageInMemory } from '../../../../test/in-memory-repository/storage-in-memory';
import { makeStore } from '../../../../test/factories/make-store';
import { makeProducts } from '../../../../test/factories/make-product';
import { DeleteProductController } from './delete-product.controller';
import { EditProductController } from './edit-product.controller';
import { UpdateStatusProductController } from './update-status-product.controller';
import { UploadProductImageController } from './upload-product-image.controller';
import { ChangeProductImageController } from './change-product-image.controller';
import { DeleteProductImageController } from './delete-product-image.controller';
import { SetMainImageController } from './set-main-image.controller';

const operations = [
  'delete',
  'edit',
  'status',
  'upload',
  'replace-image',
  'delete-image',
  'main-image',
] as const;
type Operation = (typeof operations)[number];

describe('SEG-02 product ownership (HTTP with real guards, controllers and services)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const stores = new StoresInMemoryRepository();
  const products = new ProductsInMemoryRepository(stores);
  const images = new ProductsImagesInMemoryRepository();
  const storage = new StorageInMemory();
  const file = readFileSync('img/white-logo.png');
  const members = [
    { userId: 'owner-a', storeId: 'store-a', role: 'PROPRIETARIO' },
    { userId: 'employee-a', storeId: 'store-a', role: 'FUNCIONARIO' },
    { userId: 'owner-b', storeId: 'store-b', role: 'PROPRIETARIO' },
  ];

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
        DeleteProductController,
        EditProductController,
        UpdateStatusProductController,
        UploadProductImageController,
        ChangeProductImageController,
        DeleteProductImageController,
        SetMainImageController,
      ],
      providers: [
        JwtStrategy,
        DeleteProductService,
        EditProductService,
        UpdateStatusProductService,
        UploadProductImagesService,
        ChangeProductImageService,
        DeleteProductImageService,
        SetMainImageService,
        { provide: ProductsRepository, useValue: products },
        { provide: ProductsImagesRepository, useValue: images },
        { provide: StoresRepository, useValue: stores },
        { provide: StorageService, useValue: storage },
        { provide: CategoriesRepository, useValue: {} },
        { provide: SubcategoriesRepository, useValue: {} },
        {
          provide: EnvService,
          useValue: { get: () => Buffer.from(publicKey).toString('base64') },
        },
        {
          provide: PrismaService,
          useValue: {
            store: {
              findUnique: async ({ where }: { where: { slug: string } }) =>
                stores.findBySlug(where.slug),
            },
            collaborator: {
              findFirst: async ({
                where,
              }: {
                where: { userId: string; storeId: string };
              }) =>
                members.find(
                  (member) =>
                    member.userId === where.userId &&
                    member.storeId === where.storeId,
                ) ?? null,
            },
          },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    vi.spyOn(storage, 'upload');
    vi.spyOn(storage, 'delete');
  });

  beforeEach(async () => {
    stores.items = [];
    products.items = [];
    products.tags = [];
    products.productTags = [];
    images.items = [];
    storage.items.clear();
    await makeStore(stores, { id: 'store-a', slug: 'loja-a' });
    await makeStore(stores, { id: 'store-b', slug: 'loja-b' });
    for (const [id, storeId] of [
      ['product-a', 'store-a'],
      ['product-b', 'store-b'],
      ['other-product-a', 'store-a'],
    ]) {
      const product = await makeProducts(
        products,
        storeId,
        'category',
        'subcategory',
        'ATIVO',
      );
      product.id = id;
      for (const main of [true, false]) {
        const uploaded = await storage.upload({
          body: file,
          fileName: 'image.png',
        });
        const image = await images.create({
          productId: id,
          is_main: main,
          image_url: uploaded.url,
          storage_public_id: uploaded.public_id,
        });
        image.id = `${id}-${main ? 'main' : 'secondary'}`;
      }
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  function snapshot() {
    return JSON.stringify({
      products: products.items,
      tags: products.tags,
      productTags: products.productTags,
      images: images.items,
      files: [...storage.items],
    });
  }

  function authenticated(call: request.Test, subject = 'owner-a') {
    return call.set(
      'Authorization',
      `Bearer ${jwt.sign({ role: 'USER' }, { subject })}`,
    );
  }

  function perform(
    operation: Operation,
    slug: string,
    productId: string,
    subject: string,
    imageId = `${productId}-secondary`,
  ) {
    const client = request(app.getHttpServer());
    const productUrl = `/stores/${slug}/products/${productId}`;
    const imageUrl = `/stores/${slug}/productimages/${productId}`;
    switch (operation) {
      case 'delete':
        return authenticated(client.delete(productUrl), subject);
      case 'edit':
        return authenticated(
          client.put(productUrl).send({ newDescription: 'Updated' }),
          subject,
        );
      case 'status':
        return authenticated(
          client.patch(`${productUrl}/status`).send({ status: 'INATIVO' }),
          subject,
        );
      case 'upload':
        return authenticated(
          client
            .post(imageUrl)
            .field('is_main', 'true')
            .attach('file', file, 'image.png'),
          subject,
        );
      case 'replace-image':
        return authenticated(
          client
            .patch(`${imageUrl}/${imageId}`)
            .attach('file', file, 'image.png'),
          subject,
        );
      case 'delete-image':
        return authenticated(client.delete(`${imageUrl}/${imageId}`), subject);
      case 'main-image':
        return authenticated(
          client.patch(`${imageUrl}/${imageId}/set-main`),
          subject,
        );
    }
  }

  describe.each([
    ['owner-a', 'loja-a', 'product-b'],
    ['employee-a', 'loja-a', 'product-b'],
    ['owner-b', 'loja-b', 'product-a'],
  ])('%s authorized for %s cannot change %s', (subject, slug, productId) => {
    it.each(operations)(
      'rejects %s without changing data or storage',
      async (operation) => {
        const before = snapshot();
        await perform(operation, slug, productId, subject).expect(404);
        expect(snapshot()).toBe(before);
        expect(storage.upload).not.toHaveBeenCalled();
        expect(storage.delete).not.toHaveBeenCalled();
      },
    );
  });

  it.each(operations)(
    'rejects a nonexistent product for %s without side effects',
    async (operation) => {
      const before = snapshot();
      await perform(operation, 'loja-a', 'missing', 'owner-a').expect(404);
      expect(snapshot()).toBe(before);
      expect(storage.upload).not.toHaveBeenCalled();
      expect(storage.delete).not.toHaveBeenCalled();
    },
  );

  describe.each(['owner-a', 'employee-a'])(
    '%s can manage their own product',
    (subject) => {
      it.each(operations)('allows %s', async (operation) => {
        const before = snapshot();
        await perform(operation, 'loja-a', 'product-a', subject).expect(
          operation === 'upload'
            ? 201
            : operation === 'replace-image'
              ? 200
              : 204,
        );
        expect(snapshot()).not.toBe(before);
      });
    },
  );

  describe.each(['product-b-secondary', 'other-product-a-secondary'])(
    'image %s belongs to a different product',
    (imageId) => {
      it.each(['replace-image', 'delete-image', 'main-image'] as const)(
        'rejects %s',
        async (operation) => {
          const before = snapshot();
          await perform(
            operation,
            'loja-a',
            'product-a',
            'owner-a',
            imageId,
          ).expect(404);
          expect(snapshot()).toBe(before);
          expect(storage.upload).not.toHaveBeenCalled();
          expect(storage.delete).not.toHaveBeenCalled();
        },
      );
    },
  );

  it.each([
    'product-b-secondary',
    'other-product-a-secondary',
    'missing',
    'product-a-main',
    '',
  ])(
    'validates replacement main image %j before deleting anything',
    async (newMainId) => {
      const before = snapshot();
      await authenticated(
        request(app.getHttpServer())
          .delete('/stores/loja-a/productimages/product-a/product-a-main')
          .query({ newMainId }),
      ).expect(404);
      expect(snapshot()).toBe(before);
      expect(storage.delete).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, 'product-a-secondary'])(
    'selects a main image from the same product: %s',
    async (newMainId) => {
      await authenticated(
        request(app.getHttpServer())
          .delete('/stores/loja-a/productimages/product-a/product-a-main')
          .query(newMainId ? { newMainId } : {}),
      ).expect(204);
      expect(await images.findById('product-a-main')).toBeNull();
      expect((await images.findById('product-a-secondary'))?.is_main).toBe(
        true,
      );
      expect((await images.findById('product-b-secondary'))?.is_main).toBe(
        false,
      );
    },
  );
});
