import { ProductsRepository } from "@/database/repositories/products-repository";
import { Injectable } from "@nestjs/common";
import { Product } from "@prisma/client";

@Injectable()
export class ListProductsService {
    constructor(private productsRepository: ProductsRepository){}

    async execute(page: number, name?: string, categoryId?: string, subcategoryId?: string): Promise<Product[]>{
        return await this.productsRepository.findMany(page, name, categoryId, subcategoryId)
    }
}