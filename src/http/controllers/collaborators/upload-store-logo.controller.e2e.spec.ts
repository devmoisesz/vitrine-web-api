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

describe('Upload Store Logo (E2E)', () => {
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

  test('[POST] stores/:slug/logo', async () => {
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

    await prisma.collaborator.create({
      data: {
        userId: user.id,
        storeId: store.id,
        role: 'PROPRIETARIO',
      },
    });

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const ImagePath = path.resolve(
      __dirname,
      '../../../../img/logo-vitrine-web.jpg',
    );

    const ImageBuffer = fs.readFileSync(ImagePath);

    const response = await request(app.getHttpServer())
      .post(`/stores/${store.slug}/logo`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', ImageBuffer, {
        filename: 'logo-vitrine-web.jpg',
        contentType: 'image/jpg',
      });

    expect(response.statusCode).toBe(201);

    const imageOnDatabase = await prisma.store.findUnique({
        where: {
            id: store.id
        }
    })

    //Usado para deletar a imagem após o teste
    uploadedPublicId = imageOnDatabase?.storage_public_id ?? null;

    expect(imageOnDatabase).toBeTruthy();
  });
});
