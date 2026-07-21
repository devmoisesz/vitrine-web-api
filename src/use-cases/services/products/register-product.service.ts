import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CategoriesRepository } from '@/database/repositories/categories-repository';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { InputRegisterProductDto } from './dtos/register-product.dto';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';
import { Slug } from '@/use-cases/utils/slug';

@Injectable()
export class RegisterProductService {
  constructor(
    private productsRepository: ProductsRepository,
    private categoriesRepository: CategoriesRepository,
    private subcategoriesRepository: SubcategoriesRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(store_slug: string, data: InputRegisterProductDto) {
    const store = await this.storesRepository.findBySlug(store_slug);

    if (!store) {
      throw new NotFoundException('The requested resource could not be processed.');
    }

    const category = await this.categoriesRepository.findByName(
      data.name_category,
    );

    if (!category) {
      throw new NotFoundException('The requested resource could not be processed.');
    }

    const subcategory = await this.subcategoriesRepository.findByCategoryId(
      category.id,
      data.name_subcategory,
    );

    if (!subcategory) {
      throw new NotFoundException('The requested resource could not be processed.');
    }

    const slug = Slug.createFromText(data.name_product);

    const sanitizedTags = data.tags
      ? data.tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0)
      : [];

    return await this.productsRepository.create({
      name: data.name_product,
      slug,
      tags: sanitizedTags,
      description: data.description,
      price: data.price,
      sizes: data.sizes,
      stock: data.stock,
      status: 'INATIVO',
      storeId: store.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
    });
  }
}
