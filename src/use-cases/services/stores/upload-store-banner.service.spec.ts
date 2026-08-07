import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StorageInMemory } from '../../../../test/in-memory-repository/storage-in-memory';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeFakeMulterFile } from '../../../../test/factories/make-multer-file';
import { faker } from '@faker-js/faker';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { randomUUID } from 'node:crypto';
import { UploadStoreBannerService } from './upload-store-banner.service';

let storesRepository: StoresInMemoryRepository;
let storageService: StorageInMemory;
let sut: UploadStoreBannerService;

describe('Upload Store logo Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new UploadStoreBannerService(
      storesRepository,
      storageService,
    );
  });

  it('should be possible to upload a store banner', async () => {
    const store = await makeStore(storesRepository);

    const fakeFile = makeFakeMulterFile('banner.jpg');

    await sut.execute(store.slug, fakeFile);

    const logo = await storesRepository.findBySlug(store.slug)

    expect(logo?.bannerUrl).toContain(fakeFile.filename)
    expect(logo?.bannerPublicId).toContain(store.slug)
  });

  it('should not be possible to upload a banner for a non-existent store.', async () => {
    const fakeFile = makeFakeMulterFile('imagem-6.jpg');

    await expect(() =>
      sut.execute('not exists', fakeFile),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow uploading an image for a store that already has a banner.', async () => {
    const store = await storesRepository.create({
      name: faker.company.name(),
      slug: 'slug',
      whatsapp: makeWhatsapp(),
      bannerUrl: 'fake-banner.storage',
      bannerPublicId: randomUUID()
    })

    const fakeFile = makeFakeMulterFile('banner.jpg');
    
    await expect(() =>
      sut.execute(store.slug, fakeFile),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
