import { Category, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { CategoriesRepository } from '@/database/repositories/categories-repository';

export class CategoriesInMemoryRepository implements CategoriesRepository {
  public items: Category[] = [];

  async save(category: Category): Promise<Category> {
    const itemIndex = this.items.findIndex((item) => item.id === category.id);

    this.items[itemIndex] = category;

    return category;
  }

  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    const category = {
      id: data.id ?? randomUUID(),
      name: data.name,
      slug: data.slug,
      createdAt: new Date(),
    };

    this.items.push(category);

    return category;
  }

  async findById(id: string): Promise<Category | null> {
    const category = this.items.find((item) => item.id === id);

    if (!category) return null;

    return category;
  }

  async findByName(name: string): Promise<Category | null> {
    const category = this.items.find((item) => item.name === name);

    if (!category) return null;

    return category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = this.items.find((item) => item.slug === slug);

    if (!category) return null;

    return category;
  }
}
