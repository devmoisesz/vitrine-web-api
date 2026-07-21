import { randomUUID } from "node:crypto"
import { faker } from '@faker-js/faker'
import { CategoriesInMemoryRepository } from "../in-memory-repository/categories-in-memory-repository"

export function makeCategory(
    inMemoryCategoriesRepository: CategoriesInMemoryRepository,
    slug?: string
){
    return inMemoryCategoriesRepository.create({
        id: randomUUID(),
        name: faker.person.fullName(),
        slug: slug ?? 'slug-category',
    })

}