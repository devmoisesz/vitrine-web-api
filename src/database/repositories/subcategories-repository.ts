import { Prisma, SubCategory } from "@prisma/client";

export abstract class SubcategoriesRepository {
    abstract create(data: Prisma.SubCategoryUncheckedCreateInput): Promise<SubCategory>
    abstract save(subcategory: SubCategory): Promise<SubCategory>
    abstract findByCategoryId(categoryId: string, name_subcategory: string): Promise<SubCategory | null>
    abstract findBySlug(slug: string, categoryId: string): Promise<SubCategory | null>
    abstract findById(id: string): Promise<SubCategory | null>
    abstract findMany(categoryId?: string): Promise<SubCategory[]>
}