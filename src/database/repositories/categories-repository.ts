import { Category, Prisma } from "@prisma/client";

export abstract class CategoriesRepository {
    abstract create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>
    abstract findByName(name: string): Promise<Category | null>
    abstract findBySlug(slug: string): Promise<Category | null>
}