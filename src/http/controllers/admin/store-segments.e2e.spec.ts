import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma/prisma.service';
import { SessionService } from '@/auth/session.service';
import { resetTestDatabase } from '../../../../test/e2e-database';

describe('Store segments (real PostgreSQL, HTTP and authorization)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let sessions: SessionService;
  let tokens: Record<string, string>;
  let ownerEmail: string;
  let storeId: string;
  const auth = (name: string) => ({ Authorization: `Bearer ${tokens[name]}` });
  const http = () => app.getHttpServer();

  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL!;
    const schema = new URL(databaseUrl).searchParams.get('schema')!;
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }, { schema }) });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService).useValue(prisma).compile();
    sessions = module.get(SessionService);
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); await prisma?.$disconnect(); });
  beforeEach(async () => {
    await resetTestDatabase(process.env.DATABASE_URL!);
    tokens = {};
    const store = await prisma.store.create({ data: { name: 'Loja A', slug: 'loja-a', whatsapp: '11900000001' } });
    storeId = store.id;
    const other = await prisma.store.create({ data: { name: 'Loja B', slug: 'loja-b', whatsapp: '11900000002' } });
    for (const name of ['admin', 'owner', 'employee', 'other', 'customer']) {
      const user = await prisma.user.create({ data: { name, email: `${name}@segments.test`, role: name === 'admin' ? 'ADMIN' : 'USER' } });
      if (name === 'customer') ownerEmail = user.email;
      if (name === 'owner' || name === 'employee' || name === 'other') {
        await prisma.collaborator.create({ data: { userId: user.id, storeId: name === 'other' ? other.id : store.id, role: name === 'employee' ? 'FUNCIONARIO' : 'PROPRIETARIO' } });
      }
      tokens[name] = (await sessions.create(user)).access_token;
    }
  });

  async function segment(name: string) {
    const response = await request(http()).post('/segments').set(auth('admin')).send({ name }).expect(201);
    return response.body as { id: string; name: string; slug: string };
  }

  it('allows public selection, but only an admin can create, edit or delete segments', async () => {
    await request(http()).get('/segments').expect(200, []);
    const id = randomUUID();
    for (const actor of [null, 'customer', 'owner', 'employee', 'other']) {
      for (const method of ['post', 'put', 'delete'] as const) {
        const req = request(http())[method](method === 'post' ? '/segments' : `/segments/${id}`);
        if (actor) req.set(auth(actor));
        await req.send({ name: 'Fitness' }).expect(actor ? 403 : 401);
      }
    }
    const created = await segment('Cosméticos');
    expect(created.slug).toBe('cosmeticos');
    const edited = await request(http()).put(`/segments/${created.id}`).set(auth('admin')).send({ name: 'Beleza', slug: 'beleza' }).expect(200);
    expect(edited.body).toMatchObject({ id: created.id, name: 'Beleza', slug: 'beleza' });
    await request(http()).delete(`/segments/${created.id}`).set(auth('admin')).expect(204);
    await request(http()).get('/segments').expect(200, []);
  });

  it('validates names, slugs and database uniqueness, including case-insensitive names', async () => {
    const created = await segment('Fitness');
    await request(http()).post('/segments').set(auth('admin')).send({ name: 'FITNESS', slug: 'fitness-other' }).expect(409);
    await request(http()).post('/segments').set(auth('admin')).send({ name: 'Outra', slug: 'fitness' }).expect(409);
    await request(http()).put(`/segments/${created.id}`).set(auth('admin')).send({ name: '  ' }).expect(400);
    await request(http()).post('/segments').set(auth('admin')).send({ name: 'Outra', slug: '../outra' }).expect(400);
    await request(http()).put(`/segments/${randomUUID()}`).set(auth('admin')).send({ name: 'Outra' }).expect(404);
  });

  it('registers a store with multiple segments and rejects invalid or duplicate assignments without creating a store', async () => {
    const a = await segment('Fitness');
    const b = await segment('Cosméticos');
    const body = { store_name: 'Nova loja', owner_email: ownerEmail, whatsapp: '11912345678', segmentIds: [a.id, b.id] };
    for (const segmentIds of [[a.id, a.id], [randomUUID()], ['not-a-uuid']]) {
      await request(http()).post('/store').set(auth('admin')).send({ ...body, segmentIds }).expect(400);
      expect(await prisma.store.count()).toBe(2);
    }
    await request(http()).post('/store').set(auth('customer')).send(body).expect(403);
    await request(http()).post('/store').set(auth('admin')).send(body).expect(201);
    const store = await prisma.store.findUniqueOrThrow({ where: { whatsapp: body.whatsapp }, include: { storeSegments: true } });
    expect(store.storeSegments.map(item => item.segmentId).sort()).toEqual([a.id, b.id].sort());
    expect((await request(http()).get(`/store/${store.slug}`).expect(200)).body.segments).toHaveLength(2);
  });

  it('respects existing store editing permissions and preserves omitted associations; [] removes all', async () => {
    const a = await segment('Fitness');
    const b = await segment('Cosméticos');
    for (const actor of [null, 'customer', 'employee', 'other']) {
      const req = request(http()).put('/store/loja-a/edit');
      if (actor) req.set(auth(actor));
      await req.send({ segmentIds: [a.id] }).expect(actor ? 403 : 401);
    }
    await request(http()).put('/store/loja-a/edit').set(auth('owner')).send({ segmentIds: [a.id, b.id] }).expect(204);
    await request(http()).put('/store/loja-a/edit').set(auth('owner')).send({ newDescription: 'Atualizada' }).expect(204);
    expect((await request(http()).get('/store/loja-a')).body.segments).toHaveLength(2);
    await request(http()).put('/store/loja-a/edit').set(auth('owner')).send({ newDescription: 'Não salvar', segmentIds: [randomUUID()] }).expect(400);
    expect((await request(http()).get('/store/loja-a')).body.description).toBe('Atualizada');
    await request(http()).put('/store/loja-a/edit').set(auth('admin')).send({ segmentIds: [] }).expect(204);
    expect((await request(http()).get('/store/loja-a')).body.segments).toEqual([]);
  });

  it('prevents duplicate joins and blocks deleting a segment associated even with an inactive store', async () => {
    const a = await segment('Fitness');
    await prisma.storeSegment.create({ data: { storeId, segmentId: a.id } });
    await expect(prisma.storeSegment.create({ data: { storeId, segmentId: a.id } })).rejects.toMatchObject({ code: 'P2002' });
    await prisma.store.update({ where: { id: storeId }, data: { status: 'INATIVA' } });
    const blocked = await request(http()).delete(`/segments/${a.id}`).set(auth('admin')).expect(409);
    expect(blocked.body.message).toContain('associado a lojas');
    expect(await prisma.storeSegment.count()).toBe(1);
    await request(http()).put('/store/loja-a/edit').set(auth('admin')).send({ segmentIds: [] }).expect(204);
    await request(http()).delete(`/segments/${a.id}`).set(auth('admin')).expect(204);
  });

  it('combines name and OR segments before pagination and counting, never duplicates stores and retains unclassified stores in all', async () => {
    const a = await segment('Fitness');
    const b = await segment('Cosméticos');
    for (let index = 0; index < 25; index++) {
      await prisma.store.create({ data: {
        name: `Teste filtro ${index}`, slug: `teste-${index}`, whatsapp: `1180000${String(index).padStart(4, '0')}`,
        status: index === 24 ? 'INATIVA' : 'ATIVA',
        storeSegments: { create: (index % 5 === 0 ? [a.id, b.id] : [index % 2 === 0 ? a.id : b.id]).map(segmentId => ({ segmentId })) },
      } });
    }
    await prisma.store.create({ data: { name: 'Teste filtro sem segmento', slug: 'sem-segmento', whatsapp: '11899999999' } });
    const query = { name: 'TESTE FILTRO', segments: 'fitness,cosmeticos', page: 1 };
    const first = await request(http()).get('/stores').query(query).expect(200);
    const second = await request(http()).get('/stores').query({ ...query, page: 2 }).expect(200);
    expect(first.body).toHaveLength(20);
    expect(second.body).toHaveLength(4);
    expect(first.headers['x-total-count']).toBe('24');
    expect(second.headers['x-total-count']).toBe('24');
    expect(new Set([...first.body, ...second.body].map(store => store.id)).size).toBe(24);
    expect(first.body.every(store => store.segments.length > 0)).toBe(true);
    const all = await request(http()).get('/stores').query({ name: 'TESTE FILTRO', page: 2 }).expect(200);
    expect(all.headers['x-total-count']).toBe('25');
    expect(all.body.some(store => store.slug === 'sem-segmento' && store.segments.length === 0)).toBe(true);
    const empty = await request(http()).get('/stores').query({ ...query, name: 'Não existe' }).expect(200);
    expect(empty.body).toEqual([]);
    expect(empty.headers['x-total-count']).toBe('0');
    await request(http()).get('/stores').query({ segments: '../invalid' }).expect(400);
    await request(http()).get('/stores?page=0').expect(400);
    await request(http()).get('/stores?page=1.2').expect(400);
  });
});
