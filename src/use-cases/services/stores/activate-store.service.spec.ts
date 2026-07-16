import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { ActivateStoreService } from './activate-store.service';

let storesRepository: StoresInMemoryRepository;
let sut: ActivateStoreService;

describe('Activate Store Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    sut = new ActivateStoreService(storesRepository);
  });

  it('should be possible to activate a store.', async () => {
    const store = await makeStore(storesRepository)

    store.status = 'INATIVA'

    await sut.execute(store.slug);

    expect(storesRepository.items[0].status).toEqual('ATIVA')
  });

  it('should not allow attempting to activate a store that is already deactivated.', async () => {
    const store = await makeStore(storesRepository)

    store.status = 'ATIVA'

    await expect(() =>
      sut.execute(store.slug),
    ).rejects.toBeInstanceOf(ConflictException)
  });

  it('should not allow attempting to activate a non-existent store.', async () => {
    await expect(() =>
      sut.execute('not exists'),
    ).rejects.toBeInstanceOf(NotFoundException)
  });
});
