import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { EditStoreDataService } from './edit-store-data.service';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';

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

    await sut.execute(store.slug, {
      newName: 'Fake Store',
      newDescription: 'Fake Description',
      newPaymentMethods: ['CARTAO_ENTREGA'],
      newDeliveryMethods: ['MOTOBOY', 'RETIRADA_LOJA']
    });

    const newData = await storesRepository.findById(store.id)

    expect(newData?.name).toEqual('Fake Store')
    expect(newData?.slug).toEqual('fake-store')
    expect(newData?.delivery_methods[0]).toEqual('MOTOBOY')
    expect(newData?.delivery_methods[1]).toEqual('RETIRADA_LOJA')
    expect(newData?.payment_methods[0]).toEqual('CARTAO_ENTREGA')
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

  it('should not allow changing the WhatsApp number to one that already exists.', async () => {
    const store1 = await makeStore(storesRepository)
    const store2 = await makeStore(storesRepository)

    await expect(() =>
      sut.execute(store1.slug, {
        newEmail: 'johndoe@example.com',
        newWhatsapp: store2.whatsapp
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  });
});
