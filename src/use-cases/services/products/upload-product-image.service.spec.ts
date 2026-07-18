import { beforeEach, describe, expect, it } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { StorageInMemory } from '../../../../test/in-memory-repository/storage-in-memory';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { ProductsImagesInMemoryRepository } from '../../../../test/in-memory-repository/product-images-in-memory-repository';
import { UploadProductImagesService } from './upload-product-image.service';
import { makeStore } from '../../../../test/factories/make-store';
import { makeFakeMulterFile } from '../../../../test/factories/make-multer-file';
import { makeProducts } from '../../../../test/factories/make-product';
import { makeCategory } from '../../../../test/factories/make-category';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';
import { makeProductImage } from '../../../../test/factories/make-product-image';

let productsRepository: ProductsInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let categoriesRepository: CategoriesInMemoryRepository;
let subcategoriesRepository: SubcategoriesInMemoryRepository;
let productsImagesRepository: ProductsImagesInMemoryRepository;
let storageService: StorageInMemory;
let sut: UploadProductImagesService;

describe('Register Product Images Service', () => {
  beforeEach(() => {
    productsRepository = new ProductsInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new UploadProductImagesService(
      productsRepository,
      storesRepository,
      storageService,
      productsImagesRepository,
    );
  });

  it('should be possible to register a product image', async () => {
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

    await sut.execute(store.slug ,product.id, fakeFile);

    const storedImages = await productsImagesRepository.findManyByProductId(
      product.id,
    );
    expect(storedImages).toHaveLength(1);
    expect(storedImages[0].image_url).toContain('mock-cloud');

    expect(storedImages[0].is_main).toBe(true);

    const updatedProduct = await productsRepository.findById(product.id);
    expect(updatedProduct?.status).toEqual('ATIVO');
  });

  it('should set is_main to false if the product already has images and no request was made', async () => {
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

    await makeProductImage(productsImagesRepository, {
      productId: product.id,
      is_main: true,
    });

    const fakeFile = makeFakeMulterFile('foto2.jpg');

    await sut.execute(store.slug, product.id, fakeFile);

    const storedImages = await productsImagesRepository.findManyByProductId(
      product.id,
    );
    expect(storedImages).toHaveLength(2);

    const secondImage = storedImages.find((img) => img.is_main === false);

    expect(secondImage).toBeDefined(); 
    expect(secondImage?.is_main).toBe(false);
  });

  it('should not allow more than 5 images per product', async () => {
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

    for (let i = 0; i < 5; i++) {
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: i === 0, 
      });
    }

    const fakeFile = makeFakeMulterFile('imagem-6.jpg');

    await expect(() =>
      sut.execute(store.slug ,product.id, fakeFile),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not allow more than 5 images per product', async () => {
    const category = await makeCategory(categoriesRepository);
    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );
    const product = await makeProducts(
      productsRepository,
      'not exists',
      category.id,
      subcategory.id,
    );

    for (let i = 0; i < 5; i++) {
      await makeProductImage(productsImagesRepository, {
        productId: product.id,
        is_main: i === 0, 
      });
    }

    const fakeFile = makeFakeMulterFile('imagem-6.jpg');

    await expect(() =>
      sut.execute('not exist', product.id, fakeFile),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
