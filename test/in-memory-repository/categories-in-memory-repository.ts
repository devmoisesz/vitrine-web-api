import { Category, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { CategoriesRepository } from '@/database/repositories/categories-repository';

export class CategoriesInMemoryRepository implements CategoriesRepository {
  public items: Category[] = [];

  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    const category = {
      id: data.id ?? randomUUID(),
      name: data.name,
      slug: data.slug,
      createdAt: new Date()
    };

    this.items.push(category);

    return category
  }

  async findByName(name: string): Promise<Category | null> {
    const category = this.items.find((item) => item.name === name);

    if (!category) return null;

    return category;
  }
}
