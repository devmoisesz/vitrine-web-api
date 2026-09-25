import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
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
import { PrismaService } from '@/database/prisma/prisma.service';
import { EnvService } from '@/env/env.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { JwtStrategy } from '../jwt.strategy';
import { RequireRoles } from './roles.decorator';
import { StoreAccessGuard } from './store-access.guard';

@Controller('stores/:slug')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
class ProtectedStoreController {
  @Get('member')
  @RequireRoles('PROPRIETARIO', 'FUNCIONARIO')
  member() {
    return { allowed: true };
  }

  @Get('owner')
  @RequireRoles('PROPRIETARIO')
  owner() {
    return { allowed: true };
  }
}

describe('JWT authentication and store authorization (HTTP integration)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const stores = [
    { id: 'store-a', slug: 'loja-a' },
    { id: 'store-b', slug: 'loja-b' },
  ];
  const collaborators = [
    { userId: 'owner-a', storeId: 'store-a', role: 'PROPRIETARIO' },
    { userId: 'owner-b', storeId: 'store-b', role: 'PROPRIETARIO' },
    { userId: 'employee-a', storeId: 'store-a', role: 'FUNCIONARIO' },
  ];
  // Reproduce Prisma's omission of undefined filters so the original bug fails.
  const prismaMock = {
    store: {
      findUnique: vi.fn(
        async ({ where }) =>
          stores.find((store) => store.slug === where.slug) ?? null,
      ),
    },
    collaborator: {
      findFirst: vi.fn(
        async ({ where }) =>
          collaborators.find(
            (member) =>
              member.storeId === where.storeId &&
              (where.userId === undefined || member.userId === where.userId),
          ) ?? null,
      ),
    },
  };

  beforeAll(async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    jwt = new JwtService({ privateKey, signOptions: { algorithm: 'RS256' } });
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [ProtectedStoreController],
      providers: [
        JwtStrategy,
        JwtAuthGuard,
        StoreAccessGuard,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: EnvService,
          useValue: { get: () => Buffer.from(publicKey).toString('base64') },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => vi.clearAllMocks());
  afterAll(async () => {
    await app?.close();
  });

  function access(
    subject: string,
    slug: string,
    route = 'member',
    role = 'USER',
  ) {
    const token = jwt.sign({ role }, { subject });
    return request(app.getHttpServer())
      .get(`/stores/${slug}/${route}`)
      .set('Authorization', `Bearer ${token}`);
  }

  it.each([
    ['customer-a', 'loja-a', 'store-a'],
    ['customer-b', 'loja-b', 'store-b'],
    ['owner-a', 'loja-b', 'store-b'],
    ['owner-b', 'loja-a', 'store-a'],
  ])(
    'denies %s membership and owner access to %s',
    async (subject, slug, storeId) => {
      await access(subject, slug).expect(403);
      await access(subject, slug, 'owner').expect(403);
      expect(prismaMock.collaborator.findFirst).toHaveBeenCalledTimes(2);
      expect(prismaMock.collaborator.findFirst).toHaveBeenNthCalledWith(1, {
        where: { userId: subject, storeId },
      });
      expect(prismaMock.collaborator.findFirst).toHaveBeenNthCalledWith(2, {
        where: { userId: subject, storeId },
      });
    },
  );

  it.each([
    ['owner-a', 'loja-a'],
    ['owner-b', 'loja-b'],
  ])('allows %s to access their own store', async (subject, slug) => {
    await access(subject, slug).expect(200, { allowed: true });
    await access(subject, slug, 'owner').expect(200, { allowed: true });
  });

  it('uses the authenticated employee role rather than the first owner record', async () => {
    await access('employee-a', 'loja-a').expect(200);
    await access('employee-a', 'loja-a', 'owner').expect(403);
    await access('employee-a', 'loja-b').expect(403);
  });

  it('preserves global administrator access', async () => {
    await access('admin', 'loja-b', 'owner', 'ADMIN').expect(200);
    expect(prismaMock.collaborator.findFirst).not.toHaveBeenCalled();
  });

  it.each([
    { role: 'USER' },
    { sub: '', role: 'USER' },
    { sub: '   ', role: 'USER' },
    { sub: 123, role: 'USER' },
    { role: 'ADMIN' },
  ])('rejects a signed token with invalid identity %j', async (payload) => {
    await request(app.getHttpServer())
      .get('/stores/loja-b/owner')
      .set('Authorization', `Bearer ${jwt.sign(payload)}`)
      .expect(401);
    expect(prismaMock.store.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.collaborator.findFirst).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests', async () => {
    await request(app.getHttpServer()).get('/stores/loja-a/member').expect(401);
    expect(prismaMock.store.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.collaborator.findFirst).not.toHaveBeenCalled();
  });
});
