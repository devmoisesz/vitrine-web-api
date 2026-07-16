import { Prisma, SubCategory } from "@prisma/client";

export abstract class SubcategoriesRepository {
    abstract create(data: Prisma.SubCategoryUncheckedCreateInput): Promise<SubCategory>
    abstract findByCategoryId(categoryId: string, name_subcategory: string): Promise<SubCategory | null>
}