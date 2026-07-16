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

describe('Edit Subcategory (E2E)', () => {
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
    prisma = app.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[PUT] /categories/:slug/subcategories/:id', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
        role: 'ADMIN'
      },
    });

    const category = await prisma.category.create({
        data: {
            name: 'category',
            slug: 'category'
        }
    })

    const subcategories = await prisma.subCategory.create({
        data: {
            name: 'subcategory',
            slug: 'subcategory',
            categoryId: category.id
        }
    })

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .put(`/categories/${category.slug}/subcategories/${subcategories.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'New Subcategory'
      });

    expect(response.statusCode).toBe(204);

    const subcategoryOnDatabase = await prisma.subCategory.findUnique({
      where: {
        name_categoryId: {
            categoryId: category.id,
            name: 'New Subcategory'
        }
      },
    });

    expect(subcategoryOnDatabase).toBeTruthy();
  });
});
