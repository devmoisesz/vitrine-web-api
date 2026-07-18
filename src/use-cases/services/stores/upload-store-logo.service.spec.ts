import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StorageInMemory } from '../../../../test/in-memory-repository/storage-in-memory';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeFakeMulterFile } from '../../../../test/factories/make-multer-file';
import { UploadStoreLogoService } from './upload-store-logo.service';
import { faker } from '@faker-js/faker';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { randomUUID } from 'node:crypto';

let storesRepository: StoresInMemoryRepository;
let storageService: StorageInMemory;
let sut: UploadStoreLogoService;

describe('Upload Store logo Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new UploadStoreLogoService(
      storesRepository,
      storageService,
    );
  });

  it('should be possible to upload a store logo', async () => {
    const store = await makeStore(storesRepository);

    const fakeFile = makeFakeMulterFile('logo.jpg');

    await sut.execute(store.slug, fakeFile);

    const logo = await storesRepository.findBySlug(store.slug)

    expect(logo?.logo_image_url).toContain(fakeFile.filename)
    expect(logo?.logo_image_url).toContain(store.slug)
  });

  it('should not be possible to upload a logo for a non-existent store.', async () => {
    const fakeFile = makeFakeMulterFile('imagem-6.jpg');

    await expect(() =>
      sut.execute('not exists', fakeFile),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow uploading an image for a store that already has a logo.', async () => {
    const store = await storesRepository.create({
      name: faker.company.name(),
      slug: 'slug',
      whatsapp: makeWhatsapp(),
      logo_image_url: 'fake-logo.storage',
      storage_public_id: randomUUID()
    })

    const fakeFile = makeFakeMulterFile('logo.jpg');
    
    await expect(() =>
      sut.execute(store.slug, fakeFile),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
