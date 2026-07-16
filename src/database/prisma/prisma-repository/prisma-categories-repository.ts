import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Category, Prisma } from '@prisma/client';
import { CategoriesRepository } from '@/database/repositories/categories-repository';

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.CategoryUncheckedCreateInput,
  ): Promise<Category> {
    return await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug
      },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: {
        name,
      },
    });

    if (!category) return null;

    return category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: {
        slug,
      },
    });

    if (!category) return null;

    return category;
  }
}
