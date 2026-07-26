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

describe('Set Main Image (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwt: JwtService;
  let storage: StorageService;
  let uploadedPublicId1: string | null = null;
  let uploadedPublicId2: string | null = null;

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
    if (uploadedPublicId1) {
      await storage.delete(uploadedPublicId1);
    }

    if (uploadedPublicId2) {
      await storage.delete(uploadedPublicId2);
    }

    await prisma.$disconnect();
    await app.close();
  });

  test('[PATCH] /stores/:slug/productimages/:productId/:imageId/set-main', async () => {
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

    const ImagePath1 = path.resolve(
      __dirname,
      '../../../../img/white-logo.png',
    );

    const ImageBuffer1 = fs.readFileSync(ImagePath1);

    //requisição feita para fazer upload da imagem que será usada np teste
    await request(app.getHttpServer())
      .post(`/stores/${store.slug}/productimages/${product.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', ImageBuffer1, {
        filename: 'white-logo.png',
        contentType: 'image/png',
      });

    const ImagePath2 = path.resolve(
      __dirname,
      '../../../../img/black-logo.png',
    );

    const ImageBuffer2 = fs.readFileSync(ImagePath2);

    //requisição feita para fazer upload da imagem que será usada np teste
    await request(app.getHttpServer())
      .post(`/stores/${store.slug}/productimages/${product.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', ImageBuffer2, {
        filename: 'black-logo.png',
        contentType: 'image/png',
      });

    const image = await prisma.productImages.findFirst({
      where: {
        productId: product.id,
        is_main: false,
      },
    });

    if (!image) {
      throw new Error('Image not found, test request failed.');
    }

    const response = await request(app.getHttpServer())
      .patch(`/stores/${store.slug}/productimages/${product.id}/${image.id}/set-main`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204);

    const imageOnDatabase = await prisma.productImages.findMany({
      where: {
        productId: product.id,
      },
    });

    if (!imageOnDatabase) {
      throw new Error('Image not found, test request failed.');
    }

    expect(imageOnDatabase[0].is_main).toEqual(false)
    expect(imageOnDatabase[1].is_main).toEqual(true)

    //Usado para deletar a imagem após o teste
    uploadedPublicId1 = imageOnDatabase[0].storage_public_id
    uploadedPublicId2 = imageOnDatabase[1].storage_public_id

    expect(imageOnDatabase).toBeTruthy();
  });
});
