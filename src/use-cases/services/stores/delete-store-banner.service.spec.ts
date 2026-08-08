import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StorageInMemory } from '../../../../test/in-memory-repository/storage-in-memory';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeFakeMulterFile } from '../../../../test/factories/make-multer-file';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { faker } from '@faker-js/faker';
import { DeleteStoreBannerService } from './delete-store-banner.service';

let storesRepository: StoresInMemoryRepository;
let storageService: StorageInMemory;
let sut: DeleteStoreBannerService;

describe('Delete Store banner Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new DeleteStoreBannerService(storesRepository, storageService);
  });

  it('should be possible to delete a store image', async () => {
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

    await sut.execute(store.slug);

    const banner = await storesRepository.findById(store.id);

    expect(banner?.bannerUrl).toBeNull();
    expect(banner?.bannerPublicId).toBeNull();

    expect(storageService.items).toHaveLength(0);
  });

  it('should not allow the immediate deletion of a non-existent store.', async () => {
    await expect(() => sut.execute('not exists')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should not allow changing the banner of a store that doesnt have a banner.', async () => {
    const store = await storesRepository.create({
      name: faker.company.name(),
      slug: 'slug',
      whatsapp: makeWhatsapp(),
    });

    await expect(() =>
      sut.execute(store.slug),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
