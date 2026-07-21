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
import { DeleteProductService } from './delete-product.service';

let productsRepository: ProductsInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let categoriesRepository: CategoriesInMemoryRepository;
let subcategoriesRepository: SubcategoriesInMemoryRepository;
let productsImagesRepository: ProductsImagesInMemoryRepository;
let storageService: StorageInMemory;
let sut: DeleteProductService;

describe('Delete Product Image Service', () => {
  beforeEach(() => {
    productsRepository = new ProductsInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    productsImagesRepository = new ProductsImagesInMemoryRepository();
    storageService = new StorageInMemory();

    sut = new DeleteProductService(
      productsRepository,
      productsImagesRepository,
      storageService,
    );
  });

  it('should be possible to delete a product', async () => {
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

    await sut.execute(product.id);

    expect(productsRepository.items).toHaveLength(0);
  });

  it('you must delete the product and its images', async () => {
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
      const fakeFile = makeFakeMulterFile('camisa.jpg');

      const upload = await storageService.upload({
        body: fakeFile.buffer,
        fileName: fakeFile.originalname,
        contentType: fakeFile.mimetype,
      });

      await productsImagesRepository.create({
        image_url: upload.url,
        storage_public_id: upload.public_id,
        productId: product.id,
        is_main: false,
      });
    }

    expect(storageService.items).toHaveLength(5);    

    await sut.execute(product.id);

    const storedImages = await productsImagesRepository.findById(product.id);

    expect(storedImages).not.toBeTruthy();
    expect(productsRepository.items).toHaveLength(0);
    expect(storageService.items).toHaveLength(0);
  });

  it('should not allow deleting a non-existent product', async () => {
    await expect(() =>
      sut.execute('not exists'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
