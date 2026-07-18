import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AppModule } from '../../../app.module';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { makeEmail } from '../../../../test/factories/make-email';
import { hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/database/database.module';
import cookieParser from 'cookie-parser';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import path from 'node:path';
import fs from 'node:fs';
import { StorageService } from '@/storage/storage.service';

describe('Change Product Image (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwt: JwtService;
  let storage: StorageService;
  let uploadedPublicId: string | null = null;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    })
      .overrideProvider(PrismaService)
      .useFactory({
        factory: () => {
          const databaseUrl = process.env.DATABASE_URL!;
          const schema =
            new URL(databaseUrl).searchParams.get('schema') ?? 'public';

          const adapter = new PrismaPg(
            { connectionString: databaseUrl },
            { schema },
          );

          return new PrismaClient({
            adapter,
            log: ['warn', 'error'],
          });
        },
      })
      .compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser());

    prisma = app.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    storage = app.get(StorageService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    if (uploadedPublicId) {
      await storage.delete(uploadedPublicId);
    }

    await prisma.$disconnect();
    await app.close();
  });

  test('[PATCH] /stores/:slug/productimages/:productId/:imageId', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const uniqueWhatsapp = makeWhatsapp();

    const store = await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: uniqueWhatsapp,
      },
    });

    const category = await prisma.category.create({
      data: {
        name: 'category',
        slug: 'category',
      },
    });

    const subcategory = await prisma.subCategory.create({
      data: {
        name: 'subcategory',
        slug: 'subcategory',
        categoryId: category.id,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Product White',
        slug: 'product-white',
        description: 'Product White',
        price: 69.79,
        stock: 39,
        storeId: store.id,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        status: 'INATIVO',
      },
    });

    await prisma.collaborator.create({
      data: {
        userId: user.id,
        storeId: store.id,
        role: 'FUNCIONARIO',
      },
    });

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const ImagePathDelete = path.resolve(
      __dirname,
      '../../../../img/white-logo.png',
    );

    const ImageBufferDelete = fs.readFileSync(ImagePathDelete);

    //requisição feita para fazer upload da imagem que depois será trocada
    const res = await request(app.getHttpServer())
      .post(`/stores/${store.slug}/productimages/${product.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', ImageBufferDelete, {
        filename: 'white-logo.png',
        contentType: 'image/png',
      });

    expect(res.statusCode).toEqual(201);

    const image = await prisma.productImages.findFirst({
      where: {
        productId: product.id,
      },
    });

    if (!image) {
      throw new Error('Image not found, test request failed.');
    }

    const ImagePathChange = path.resolve(
      __dirname,
      '../../../../img/black-logo.png',
    );

    const ImageBufferChange = fs.readFileSync(ImagePathChange);

    const response = await request(app.getHttpServer())
      .patch(`/stores/${store.slug}/productimages/${product.id}/${image.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', ImageBufferChange, {
        filename: 'black-logo.png',
        contentType: 'image/png',
      });

    expect(response.statusCode).toBe(200);

    const imageOnDatabase = await prisma.productImages.findFirst({
      where: {
        productId: product.id,
      },
    });

    if (!imageOnDatabase) {
      throw new Error('Image not found, test request failed.');
    }

    //Usado para deletar a imagem após o teste
    uploadedPublicId = imageOnDatabase.storage_public_id;

    expect(imageOnDatabase).toBeTruthy();
    //verifica se a imagem antiga foi deletada
    expect(imageOnDatabase.storage_public_id).not.toBe(image.storage_public_id);
    expect(imageOnDatabase?.is_main).toBe(true);
  });
});
