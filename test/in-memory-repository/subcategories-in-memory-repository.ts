import { Prisma, SubCategory } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';

export class SubcategoriesInMemoryRepository implements SubcategoriesRepository {
  public items: SubCategory[] = [];

  async findById(id: string): Promise<SubCategory | null> {
    const subcategory = await this.items.find((item) => item.id === id)

    if(!subcategory) return null

    return subcategory
  }

  async create(
    data: Prisma.SubCategoryUncheckedCreateInput,
  ): Promise<SubCategory> {
    const category = {
      id: data.id ?? randomUUID(),
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      createdAt: new Date(),
    };

    this.items.push(category);

    return category;
  }

  async save(subcategory: SubCategory): Promise<SubCategory> {
    const itemIndex = this.items.findIndex((item) => item.id === subcategory.id);

    this.items[itemIndex] = subcategory;

    return subcategory;
  }

  async findByCategoryId(
    categoryId: string,
    name_subcategory: string,
  ): Promise<SubCategory | null> {
  const category = this.items.find(
      (item) =>
        item.categoryId === categoryId && item.name === name_subcategory,
    );

    if (!category) return null;

    return category;
  }
}
