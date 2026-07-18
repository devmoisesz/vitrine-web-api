import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StorageInMemory } from '../../../../test/in-memory-repository/storage-in-memory';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeFakeMulterFile } from '../../../../test/factories/make-multer-file';
import { ChangeStoreLogoService } from './change-store-logo.service';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { faker } from '@faker-js/faker';

let storesRepository: StoresInMemoryRepository;
let storageService: StorageInMemory;
let sut: ChangeStoreLogoService;

describe('Change Store Logo Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new ChangeStoreLogoService(storesRepository, storageService);
  });

  it('should be possible to change a store image', async () => {
    const fakeFileDeleted = makeFakeMulterFile('logo1.jpg');

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

    await storesRepository.saveImage(store.id, upload.url, upload.public_id);

    const newFakeFile = makeFakeMulterFile('logo2.jpg');

    await sut.execute(store.slug, newFakeFile);

    const logo = await storesRepository.findBySlug(store.slug);

    expect(logo?.logo_image_url).toContain(newFakeFile.filename);

    expect(storageService.items).toHaveLength(1);
  });

  it('not allow uploading a logo for a non-existent logo.', async () => {
    const fakeFile = makeFakeMulterFile('logo1.jpg');

    await expect(() =>
      sut.execute('not exists', fakeFile),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow changing the logo of a store that doesnt have a logo.', async () => {
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
