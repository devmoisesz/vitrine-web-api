import { randomUUID } from "node:crypto"
import { faker } from '@faker-js/faker'
import { SubcategoriesInMemoryRepository } from "../in-memory-repository/subcategories-in-memory-repository"

export function makeSubCategory(
    inMemorySubCategoriesRepository: SubcategoriesInMemoryRepository,
    categoryId: string
){
    return inMemorySubCategoriesRepository.create({
        id: randomUUID(),
        name: faker.person.fullName(),
        slug: 'slug-subcategory',
        categoryId,
    })

}