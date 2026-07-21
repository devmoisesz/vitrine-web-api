import { beforeEach, describe, expect, it } from 'vitest';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { ListStoresService } from './list-stores.service';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';

describe('List Stores Service', () => {
  let storesRepository: StoresInMemoryRepository;
  let generatorSlugUnique: SlugGeneratorService
  let sut: ListStoresService;

  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    generatorSlugUnique = new SlugGeneratorService(storesRepository)
    sut = new ListStoresService(storesRepository);
  });

  it('should return only the filtered requests', async () => {
    for (let i = 0; i < 23; i++) {
      await storesRepository.create({
        name: 'Store All Black',
        slug: await generatorSlugUnique.execute('Store All Black'),
        whatsapp: makeWhatsapp(),
        description: 'Good Store All Black'
      });
    }

    for (let i = 0; i < 10; i++) {
      await storesRepository.create({
        name: 'Store All Blue',
        slug: await generatorSlugUnique.execute('Store All Blue'),
        whatsapp: makeWhatsapp(),
        description: 'Good Store All Blue'
      });
    }

    const page = 1;

    const result = await sut.execute(page, 'black');

    expect(result).toHaveLength(23);
  });

  it('should return the stores from page 1', async () => {
    for(let i = 0; i < 50; i++){
        await makeStore(storesRepository);
    }

    const page = 1;

    const result = await sut.execute(page);

    expect(result).toHaveLength(40);
  });

  it('should return the stores from page 2', async () => {
    for(let i = 0; i < 50; i++){
        await makeStore(storesRepository);
    }

    const page = 2;

    const result = await sut.execute(page);

    expect(result).toHaveLength(10);
  });
});
