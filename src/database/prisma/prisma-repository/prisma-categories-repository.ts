import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Category, Prisma } from '@prisma/client';
import { CategoriesRepository } from '@/database/repositories/categories-repository';

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<Category[]> {
    return await this.prisma.category.findMany()
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: {
        id
      }
    })

    if(!category){
      throw new Error('Category Not found')
    }

    return category
  }

  async save(category: Category): Promise<Category> {
    return this.prisma.category.update({
      where: {
        id: category.id
      },
      data: {
        name: category.name,
        slug: category.slug
      }
    })
  }

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
