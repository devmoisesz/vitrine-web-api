import { Prisma, SubCategory } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';

export class SubcategoriesInMemoryRepository implements SubcategoriesRepository {
  public items: SubCategory[] = [];

  async create(data: Prisma.SubCategoryUncheckedCreateInput): Promise<SubCategory> {
    const category = {
      id: data.id ?? randomUUID(),
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      createdAt: new Date()
    };

    this.items.push(category);

    return category
  }

  async findByCategoryId(categoryId: string, name_subcategory: string): Promise<SubCategory | null> {
    const category = this.items.find((item) => item.categoryId === categoryId && item.name === name_subcategory);

    if (!category) return null;

    return category;
  }
}
