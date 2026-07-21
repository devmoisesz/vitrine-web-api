import { SubcategoriesRepository } from "@/database/repositories/subcategories-repository";
import { Injectable } from "@nestjs/common";
import { SubCategory } from "@prisma/client";

@Injectable()
export class ListSubcategoriesService {
    constructor(private subcategoriesRepository: SubcategoriesRepository){}

    async execute(categoryId?: string): Promise<SubCategory[]>{
        return await this.subcategoriesRepository.findMany(categoryId)
    }
}