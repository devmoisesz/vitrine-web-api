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

describe('Delete Product (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwt: JwtService;

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

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[DELETE] /stores/:slug/products/:productId', async () => {
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

    //requisição feita para fazer upload da imagem que depois será deletada
    await request(app.getHttpServer())
      .post(`/stores/${store.slug}/productimages/${product.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('is_main', true)
      .attach('file', ImageBufferDelete, {
        filename: 'white-logo.png',
        contentType: 'image/png',
      });

    const images = await prisma.productImages.findMany({
      where: {
        productId: product.id,
      },
    });

    if (!images) {
      throw new Error('Image not found, test request failed.');
    }

    const response = await request(app.getHttpServer())
      .delete(`/stores/${store.slug}/products/${product.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204);

    const productOnDatabase = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });

    if (productOnDatabase) {
      throw new Error('Image found, test request failed.');
    }

    expect(productOnDatabase).not.toBeTruthy();

    const imageOnDatabase = await prisma.productImages.findFirst({
      where: {
        productId: product.id,
      },
    });

    if (imageOnDatabase) {
      throw new Error('Image found, test request failed.');
    }

    expect(imageOnDatabase).not.toBeTruthy();
  });
});
