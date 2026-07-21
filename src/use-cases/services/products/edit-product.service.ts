import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from '@/database/repositories/categories-repository';
import { InputEditProductDto } from './dtos/edit-product.dto';
import { ProductsRepository } from '@/database/repositories/products-repository';
import { Slug } from '@/use-cases/utils/slug';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';

@Injectable()
export class EditProductService {
  constructor(
    private productsRepository: ProductsRepository,
    private categoriesRepository: CategoriesRepository,
    private subcategoriesRepository: SubcategoriesRepository,
  ) {}

  async execute(productId: string, data: InputEditProductDto): Promise<void> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    let categoryId = product.categoryId;
    let subcategoryId = product.subcategoryId;
    let slug = product.slug;

    if (data.newNameProduct) {
      slug = Slug.createFromText(data.newNameProduct);
    }

    if (data.newCategory) {
      const currentCategory = await this.categoriesRepository.findById(
        product.categoryId,
      );

      if (data.newCategory !== currentCategory?.name) {
        const newCategory = await this.categoriesRepository.findByName(
          data.newCategory,
        );

        if (!newCategory) {
          throw new NotFoundException(
            'The requested resource could not be processed.',
          );
        }

        categoryId = newCategory.id;
      }
    }

    if (data.newSubcategory) {
      const currentSubcategory = await this.subcategoriesRepository.findById(
        product.subcategoryId,
      );

      if (data.newSubcategory !== currentSubcategory?.name) {
        const newSubcategory =
          await this.subcategoriesRepository.findByCategoryId(
            categoryId,
            data.newSubcategory,
          );

        if (!newSubcategory) {
          throw new NotFoundException(
            'The requested resource could not be processed.',
          );
        }

        subcategoryId = newSubcategory.id;
      }
    }

    await this.productsRepository.save({
      id: product.id,
      name: data.newNameProduct ?? product.name,
      description: data.newDescription ?? product.description,
      price: data.newPrice ?? product.price.toNumber(),
      sizes: data.newSizes,
      slug,
      stock: data.newStock ?? product.stock,
      status: 'ATIVO',
      storeId: product.storeId,
      categoryId,
      subcategoryId,
      tags: data.newTags,
    });
  }
}
