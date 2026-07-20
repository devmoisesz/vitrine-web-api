import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, SubCategory } from '@prisma/client';
import { SubcategoriesRepository } from '@/database/repositories/subcategories-repository';

@Injectable()
export class PrismaSubcategoriesRepository implements SubcategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(categoryId?: string): Promise<SubCategory[]> {
     return await this.prisma.subCategory.findMany({
      where: {
        categoryId: categoryId ? categoryId : undefined
      },
      orderBy: {
        name: 'asc'
      }
     })

  }

  async save(subcategory: SubCategory): Promise<SubCategory> {
    return await this.prisma.subCategory.update({
      where: {
        id: subcategory.id
      },
      data: {
        name: subcategory.name,
        slug: subcategory.slug
      }
    })
  }

  async findById(id: string): Promise<SubCategory | null> {
    const subcategory = await this.prisma.subCategory.findUnique({
      where: {
        id
      }
    })

    if(!subcategory) return null

    return subcategory
  }

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
