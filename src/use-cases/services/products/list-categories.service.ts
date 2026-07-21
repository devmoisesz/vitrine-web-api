import { CategoriesRepository } from "@/database/repositories/categories-repository";
import { Injectable } from "@nestjs/common";
import { Category } from "@prisma/client";

@Injectable()
export class ListCategoriesService {
    constructor(private categoriesRepository: CategoriesRepository){}

    async execute(): Promise<Category[]>{
        return await this.categoriesRepository.findMany()
    }
}