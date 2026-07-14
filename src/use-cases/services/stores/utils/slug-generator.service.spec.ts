import { beforeEach, describe, expect, it } from 'vitest';
import { SlugGeneratorService } from './generate-slug.service';
import { StoresInMemoryRepository } from '../../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../../test/factories/make-store';
import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';

let storesRepository: StoresInMemoryRepository;
let sut: SlugGeneratorService;

describe('Slug Generator Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    sut = new SlugGeneratorService(storesRepository);
  });

  it('should be able to generate a simple slug from store name.', async () => {
    const slug = await sut.execute('Minha Loja Incrível');

    expect(slug).toBe('minha-loja-incrivel');
  });

  it('should be able to generate an incremental slug when a collision occurs.', async () => {
    await storesRepository.create({
        id: randomUUID(),
        name: 'Loja do João',
        slug: 'loja-do-joao',
        description: faker.lorem.text(),
        whatsapp: faker.phone.imei()
    })

    const slug = await sut.execute('Loja do João');

    expect(slug).toBe('loja-do-joao-1');
  });

  it('should be able to increment the suffix further if multiple collisions occur.', async () => {
    await storesRepository.create({
        id: randomUUID(),
        name: 'Loja do João',
        slug: 'loja-do-joao',
        description: faker.lorem.text(),
        whatsapp: faker.phone.imei()
    })

    await storesRepository.create({
        id: randomUUID(),
        name: 'Loja do João',
        slug: 'loja-do-joao-1',
        description: faker.lorem.text(),
        whatsapp: faker.phone.imei()
    })

    const slug = await sut.execute('Loja do João');

    expect(slug).toBe('loja-do-joao-2');
  });

  it('should return the same slug if the collision is owned by the current store.', async () => {
    const existingStore = await makeStore(storesRepository, {
      slug: 'loja-do-joao',
    });

    const slug = await sut.execute('Loja do João', existingStore.id);

    expect(slug).toBe('loja-do-joao');
  });
});