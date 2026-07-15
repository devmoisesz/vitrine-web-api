import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeactivateStoreService } from './deactivate-store.service';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';

let storesRepository: StoresInMemoryRepository;
let sut: DeactivateStoreService;

describe('Deactivate Store Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    sut = new DeactivateStoreService(storesRepository);
  });

  it('should be possible to deactivate a store.', async () => {
    const store = await makeStore(storesRepository)

    await sut.execute(store.slug);

    expect(storesRepository.items[0].status).toEqual('Inativa')
  });

  it('should not allow attempting to deactivate a store that is already deactivated.', async () => {
    const store = await makeStore(storesRepository)

    store.status = 'Inativa'

    await expect(() =>
      sut.execute(store.slug),
    ).rejects.toBeInstanceOf(ConflictException)
  });

  it('should not allow attempting to deactivate a non-existent store.', async () => {
    await expect(() =>
      sut.execute('not exists'),
    ).rejects.toBeInstanceOf(NotFoundException)
  });
});
