import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StorageInMemory } from '../../../../test/in-memory-repository/storage-in-memory';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeFakeMulterFile } from '../../../../test/factories/make-multer-file';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { faker } from '@faker-js/faker';
import { ChangeStoreBannerService } from './change-store-banner.service';

let storesRepository: StoresInMemoryRepository;
let storageService: StorageInMemory;
let sut: ChangeStoreBannerService;

describe('Change Store banner Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new ChangeStoreBannerService(storesRepository, storageService);
  });

  it('should be possible to change the store banner', async () => {
    const fakeFileDeleted = makeFakeMulterFile('banner1.jpg');

    const store = await storesRepository.create({
      name: faker.company.name(),
      slug: 'slug',
      whatsapp: makeWhatsapp(),
    });

    const upload = await storageService.upload({
      body: fakeFileDeleted.buffer,
      fileName: fakeFileDeleted.originalname,
      contentType: fakeFileDeleted.mimetype,
    });

    await storesRepository.saveBanner(store.id, upload.url, upload.public_id);

    const newFakeFile = makeFakeMulterFile('banner2.jpg');

    await sut.execute(store.slug, newFakeFile);

    const banner = await storesRepository.findBySlug(store.slug);

    expect(banner?.bannerUrl).toContain(newFakeFile.filename);

    expect(storageService.items).toHaveLength(1);
  });

  it('not allow uploading a banner for a non-existent banner.', async () => {
    const fakeFile = makeFakeMulterFile('banner1.jpg');

    await expect(() =>
      sut.execute('not exists', fakeFile),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow changing the banner of a store that doesnt have a banner.', async () => {
    const store = await storesRepository.create({
      name: faker.company.name(),
      slug: 'slug',
      whatsapp: makeWhatsapp(),
    });

    const fakeFile = makeFakeMulterFile('image.jpg');

    await expect(() =>
      sut.execute(store.slug, fakeFile),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
