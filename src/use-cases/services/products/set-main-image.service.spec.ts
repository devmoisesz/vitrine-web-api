import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StorageInMemory } from '../../../../test/in-memory-repository/storage-in-memory';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeFakeMulterFile } from '../../../../test/factories/make-multer-file';
import { makeProducts } from '../../../../test/factories/make-product';
import { makeCategory } from '../../../../test/factories/make-category';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { SetMainImageService } from './set-main-image.service';

let productsRepository: ProductsInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let categoriesRepository: CategoriesInMemoryRepository;
let subcategoriesRepository: SubcategoriesInMemoryRepository;
let productsImagesRepository: ProductsImagesInMemoryRepository;
let storageService: StorageInMemory;
let sut: SetMainImageService;

describe('Change Product Image Service', () => {
  beforeEach(() => {
    productsRepository = new ProductsInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new SetMainImageService(
      productsRepository,
      productsImagesRepository,
    );
  });

  it('should be possible to set an existing image as the main one', async () => {
    const store = await makeStore(storesRepository);
    const category = await makeCategory(categoriesRepository);
    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );
    const product = await makeProducts(
      productsRepository,
      store.id,
      category.id,
      subcategory.id,
    );

    const fakeFileDeleted = makeFakeMulterFile('camisa.jpg');

    const upload1 = await storageService.upload({
      body: fakeFileDeleted.buffer,
      fileName: fakeFileDeleted.originalname,
      contentType: fakeFileDeleted.mimetype,
    });

    const productImage1 = await productsImagesRepository.create({
      image_url: upload1.url,
      storage_public_id: upload1.public_id,
      productId: product.id,
      is_main: true,
    });

    const newFakeFile = makeFakeMulterFile('bermuda.jpg');

    const upload = await storageService.upload({
      body: newFakeFile.buffer,
      fileName: newFakeFile.originalname,
      contentType: newFakeFile.mimetype,
    });

    const productImage2 = await productsImagesRepository.create({
      image_url: upload.url,
      storage_public_id: upload.public_id,
      productId: product.id,
      is_main: false,
    });

    await sut.execute(product.id, productImage2.id);

    const storedImages = await productsImagesRepository.findManyByProductId(
      product.id,
    );
    expect(storedImages).toHaveLength(2);

    const newImageMain = storedImages.find((img) => img.id === productImage2.id);

    expect(newImageMain?.is_main).toEqual(true);

    const oldMainImage = storedImages.find((img) => img.id === productImage1.id)

    expect(oldMainImage?.is_main).toEqual(false)
  });

  it('should not allow setting an image as the main one if it does not exist.', async () => {
    const store = await makeStore(storesRepository);
    const category = await makeCategory(categoriesRepository);
    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );
    const product = await makeProducts(
      productsRepository,
      store.id,
      category.id,
      subcategory.id,
    );

    await expect(() =>
      sut.execute(product.id, 'not exists'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow setting an image as the main one if it is already the main one.', async () => {
    const store = await makeStore(storesRepository);
    const category = await makeCategory(categoriesRepository);
    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );
    const product = await makeProducts(
      productsRepository,
      store.id,
      category.id,
      subcategory.id,
    );

    const fakeFile = makeFakeMulterFile('image.jpg');

    const upload = await storageService.upload({
      body: fakeFile.buffer,
      fileName: fakeFile.originalname,
      contentType: fakeFile.mimetype,
    });

    const productImage = await productsImagesRepository.create({
      image_url: upload.url,
      storage_public_id: upload.public_id,
      productId: product.id,
      is_main: true,
    });

    await expect(() =>
      sut.execute(product.id, productImage.id),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
