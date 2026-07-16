import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, SubCategory } from '@prisma/client';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';

@Injectable()
export class PrismaSubcategoriesRepository implements SubcategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.SubCategoryUncheckedCreateInput,
  ): Promise<SubCategory> {
    return await this.prisma.subCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId
      },
    });
  }

  async findByCategoryId(categoryId: string, name_subcategory: string): Promise<SubCategory | null> {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: {
        name_categoryId: {
            name: name_subcategory,
            categoryId
        }
      }
    });

    if (!subCategory) return null;

    return subCategory;
  }
}
