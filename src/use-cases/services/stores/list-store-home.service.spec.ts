import { beforeEach, describe, expect, it } from 'vitest';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { ListStoreHomeService } from './list-store-home.service';
import { makeProducts } from '../../../../test/factories/make-product';
import { ProductsInMemoryRepository } from '../../../../test/in-memory-repository/product-in-memory-repository';
import { makeCategory } from '../../../../test/factories/make-category';
import { CategoriesInMemoryRepository } from '../../../../test/in-memory-repository/categories-in-memory-repository';
import { SubcategoriesInMemoryRepository } from '../../../../test/in-memory-repository/subcategories-in-memory-repository';
import { makeSubCategory } from '../../../../test/factories/make-subcategory';

describe('List Store Home Service', () => {
  let storesRepository: StoresInMemoryRepository;
  let productsRepository: ProductsInMemoryRepository;
  let categoriesRepository: CategoriesInMemoryRepository;
  let subcategoriesRepository: SubcategoriesInMemoryRepository;
  let generatorSlugUnique: SlugGeneratorService;
  let sut: ListStoreHomeService;

  beforeEach(() => {
      productsRepository = new ProductsInMemoryRepository();
      storesRepository = new StoresInMemoryRepository(productsRepository);
    categoriesRepository = new CategoriesInMemoryRepository();
    subcategoriesRepository = new SubcategoriesInMemoryRepository();
    generatorSlugUnique = new SlugGeneratorService(storesRepository);
    sut = new ListStoreHomeService(storesRepository);
  });

  it('should return only the filtered requests', async () => {
    const store1 = await storesRepository.create({
      name: 'Store All Black',
      slug: await generatorSlugUnique.execute('Store All Black'),
      whatsapp: makeWhatsapp(),
      description: 'Good Store All Black',
    });

    const store2 = await storesRepository.create({
      name: 'Store All Blue',
      slug: await generatorSlugUnique.execute('Store All Blue'),
      whatsapp: makeWhatsapp(),
      description: 'Good Store All Blue',
    });

    const category = await makeCategory(categoriesRepository);
    const subcategory = await makeSubCategory(
      subcategoriesRepository,
      category.id,
    );

    for (let i = 0; i < 9; i++) {
      await makeProducts(
        productsRepository,
        store1.id,
        category.id,
        subcategory.id,
        'ATIVO',
      );
    }

    for (let i = 0; i < 9; i++) {
      await makeProducts(
        productsRepository,
        store2.id,
        category.id,
        subcategory.id,
        'ATIVO',
      );
    }

    const page = 1;

    const result = await sut.execute(page);

    expect(result.stores).toHaveLength(2);
  });
});
