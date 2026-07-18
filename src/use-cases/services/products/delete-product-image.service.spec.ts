import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
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
import { makeProductImage } from '../../../../test/factories/make-product-image';
import { DeleteProductImageService } from './delete-product-image.service';

let productsRepository: ProductsInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let categoriesRepository: CategoriesInMemoryRepository;
let subcategoriesRepository: SubcategoriesInMemoryRepository;
let productsImagesRepository: ProductsImagesInMemoryRepository;
let storageService: StorageInMemory;
let sut: DeleteProductImageService;

describe('Delete Product Image Service', () => {
  beforeEach(() => {
    productsRepository = new ProductsInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new DeleteProductImageService(
      productsRepository,
      storageService,
      productsImagesRepository,
    );
  });

  it('should be possible to delete a product image', async () => {
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

    const fakeFile = makeFakeMulterFile('camisa.jpg');

    const upload = await storageService.upload({
      body: fakeFile.buffer,
      fileName: fakeFile.originalname,
      contentType: fakeFile.mimetype,
    });

    const productImage = await productsImagesRepository.create({
      image_url: upload.url,
      storage_public_id: upload.public_id,
      productId: product.id,
      is_main: false,
    });

    await sut.execute(product.id, productImage.id);

    const storedImages = await productsImagesRepository.findById(product.id);

    expect(storedImages).not.toBeTruthy();
    expect(storageService.items).toHaveLength(0);
  });

  it('when attempting to delete a main image, the next main image becomes the most recent one.', async () => {
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

    const firstFakeFile = makeFakeMulterFile('camisa1.jpg');
    const secondFakeFile = makeFakeMulterFile('camisa2.jpg');

    const firstUpload = await storageService.upload({
      body: firstFakeFile.buffer,
      fileName: firstFakeFile.originalname,
      contentType: firstFakeFile.mimetype,
    });

    const secondUpload = await storageService.upload({
      body: secondFakeFile.buffer,
      fileName: secondFakeFile.originalname,
      contentType: secondFakeFile.mimetype,
    });

    const productImageDeleted = await productsImagesRepository.create({
      image_url: firstUpload.url,
      storage_public_id: firstUpload.public_id,
      productId: product.id,
      is_main: true,
    });

    const nextImageMain = await productsImagesRepository.create({
      image_url: secondUpload.url,
      storage_public_id: secondUpload.public_id,
      productId: product.id,
      is_main: false,
    });

    await sut.execute(product.id, productImageDeleted.id);

    const imageDeleted = await productsImagesRepository.findById(
      productImageDeleted.id,
    );

    expect(imageDeleted).toBeNull();

    const newImageMain = await productsImagesRepository.findById(
      nextImageMain.id,
    );

    expect(newImageMain?.is_main).toBe(true);
  });

  it('when deleting a main image, the next main image should be the one provided in the parameter.', async () => {
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

    const firstFakeFile = makeFakeMulterFile('camisa1.jpg');
    const secondFakeFile = makeFakeMulterFile('camisa1.jpg');
    const thirdFakeFile = makeFakeMulterFile('camisa3.jpg');

    const firstUpload = await storageService.upload({
      body: firstFakeFile.buffer,
      fileName: firstFakeFile.originalname,
      contentType: firstFakeFile.mimetype,
    });

    const secondUpload = await storageService.upload({
      body: secondFakeFile.buffer,
      fileName: secondFakeFile.originalname,
      contentType: secondFakeFile.mimetype,
    });

    const thirdUpload = await storageService.upload({
      body: thirdFakeFile.buffer,
      fileName: thirdFakeFile.originalname,
      contentType: thirdFakeFile.mimetype,
    });

    const productImageDeleted = await productsImagesRepository.create({
      image_url: firstUpload.url,
      storage_public_id: firstUpload.public_id,
      productId: product.id,
      is_main: true,
    });

    const nonPrincipal = await productsImagesRepository.create({
      image_url: secondUpload.url,
      storage_public_id: secondUpload.public_id,
      productId: product.id,
      is_main: false,
    });

    const nextImageMain = await productsImagesRepository.create({
      image_url: thirdUpload.url,
      storage_public_id: thirdUpload.public_id,
      productId: product.id,
      is_main: false,
    });

    await sut.execute(product.id, productImageDeleted.id, nextImageMain.id);

    const imageDeleted = await productsImagesRepository.findById(
      productImageDeleted.id,
    );

    expect(imageDeleted).toBeNull();

    const newImageMain = await productsImagesRepository.findById(
      nextImageMain.id,
    );

    expect(newImageMain?.is_main).toBe(true);

    const imageNonPrincipal = await productsImagesRepository.findById(
      nonPrincipal.id,
    );

    expect(imageNonPrincipal?.is_main).toBe(false);
  });

  it('should not allow deleting an image without a product.', async () => {
    const productImage = await makeProductImage(productsImagesRepository, {
      productId: 'not exists',
      is_main: true,
    });

    await expect(() =>
      sut.execute('not exists', productImage.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow deleting an image that does not exist.', async () => {
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
});
