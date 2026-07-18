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
import { ChangeProductImageService } from './change-product-image.service';

let productsRepository: ProductsInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let categoriesRepository: CategoriesInMemoryRepository;
let subcategoriesRepository: SubcategoriesInMemoryRepository;
let productsImagesRepository: ProductsImagesInMemoryRepository;
let storageService: StorageInMemory;
let sut: ChangeProductImageService;

describe('Change Product Image Service', () => {
  beforeEach(() => {
    productsRepository = new ProductsInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new ChangeProductImageService(
      productsRepository,
      storageService,
      productsImagesRepository,
    );
  });

  it('should be possible to change a product image', async () => {
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

    const upload = await storageService.upload({
      body: fakeFileDeleted.buffer,
      fileName: fakeFileDeleted.originalname,
      contentType: fakeFileDeleted.mimetype,
    });

    const productImage = await productsImagesRepository.create({
      image_url: upload.url,
      storage_public_id: upload.public_id,
      productId: product.id,
      is_main: true,
    });

    const newFakeFile = makeFakeMulterFile('bermuda.jpg');

    await sut.execute(product.id, productImage.id, newFakeFile);

    const storedImages = await productsImagesRepository.findManyByProductId(
      product.id,
    );
    expect(storedImages).toHaveLength(1);

    const image = storedImages.find((img) => img.is_main === true);

    expect(image?.is_main).toBe(true);

    expect(storageService.items).toHaveLength(1);
  });

  it('Swapping an image that wasnt the main one should return a new image that also isnt the main one.', async () => {
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

    const upload = await storageService.upload({
      body: fakeFileDeleted.buffer,
      fileName: fakeFileDeleted.originalname,
      contentType: fakeFileDeleted.mimetype,
    });

    const productImage = await productsImagesRepository.create({
      image_url: upload.url,
      storage_public_id: upload.public_id,
      productId: product.id,
      is_main: false,
    });

    const newFakeFile = makeFakeMulterFile('bermuda.jpg');

    await sut.execute(product.id, productImage.id, newFakeFile);

    const storedImages = await productsImagesRepository.findManyByProductId(
      product.id,
    );
    expect(storedImages).toHaveLength(1);

    const image = storedImages.find((img) => img.is_main === false);

    expect(image?.is_main).toBe(false);
  });

  it('should not allow replacing an image for a product that does not exist.', async () => {
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

    const productImage = await makeProductImage(productsImagesRepository, {
      productId: product.id,
      is_main: true,
    });

    const fakeFile = makeFakeMulterFile('nova.jpg');

    await expect(() =>
      sut.execute('not exists', productImage.id, fakeFile),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow replacing an image that does not exist', async () => {
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

    await expect(() =>
      sut.execute(product.id, 'not exists', fakeFile),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
