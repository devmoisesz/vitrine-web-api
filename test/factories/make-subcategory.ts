import { randomUUID } from "node:crypto"
import { faker } from '@faker-js/faker'
import { SubCategoriesInMemoryRepository } from "../in-memory-repository/subcategories-in-memory-repository"

export function makeSubCategory(
    inMemorySubCategoriesRepository: SubCategoriesInMemoryRepository,
    categoryId: string
){
    return inMemorySubCategoriesRepository.create({
        id: randomUUID(),
        name: faker.person.fullName(),
        slug: 'slug-subcategory',
        categoryId,
    })

}