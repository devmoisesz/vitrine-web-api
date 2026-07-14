import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EditStoreDataService } from './edit-data-store.service';
import { SlugGeneratorService } from './utils/generate-slug.service';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';

let storesRepository: StoresInMemoryRepository;
let slugGenerator: SlugGeneratorService
let sut: EditStoreDataService;

describe('Edit Data Store Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository()
    slugGenerator = new SlugGeneratorService(storesRepository)
    sut = new EditStoreDataService(storesRepository, slugGenerator);
  });

  it('should be possible to update store data.', async () => {
  const store = await makeStore(storesRepository)

    const newStoreData = await sut.execute(store.slug, {
      newName: 'Fake Store',
      newDescription: 'Fake Description',
    });

    expect(newStoreData.name).not.toEqual(store.name)
    expect(newStoreData.description).not.toEqual(store.description)
    expect(newStoreData.email).toEqual(store.email)
    expect(newStoreData.slug).not.toEqual(store.slug)
  });

  it('should be possible to update only the email.', async () => {
    const store = await makeStore(storesRepository)

    const newStoreData = await sut.execute(store.slug,{
      newEmail: 'fake@email.com'
    });

    expect(newStoreData.email).not.toEqual(store.email)
  });

  it('should be possible to edit a non-existent store.', async () => {
    await expect(() =>
      sut.execute('not exists',{
        newName: 'Fake name'
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  });

  it('should not be possible to edit using an existing email address.', async () => {
    const store1 = await makeStore(storesRepository)
    const store2 = await makeStore(storesRepository)

    await expect(() =>
      sut.execute(store1.slug, {
        newEmail: store2.email!
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  });
});
