import { Prisma, ProductImages } from "@prisma/client";

export abstract class ProductsImagesRepository {
    abstract create(data: Prisma.ProductImagesUncheckedCreateInput): Promise<ProductImages>
    abstract findManyByProductId(productId: string): Promise<ProductImages[]>
    abstract findById(id: string): Promise<ProductImages | null>
    abstract remove(id: string): Promise<void>
}