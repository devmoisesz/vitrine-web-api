import { ProductsRepository } from "@/database/repositories/products-repository";
import { Injectable } from "@nestjs/common";
import { Product } from "@prisma/client";

@Injectable()
export class ListGlobalProductsService {
    constructor(private productsRepository: ProductsRepository){}

    async execute(page: number, name?: string): Promise<Product[]>{
        return await this.productsRepository.findMany(page, name)
    }
}