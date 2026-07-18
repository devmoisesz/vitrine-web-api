import { faker } from '@faker-js/faker'
import { ProductsInMemoryRepository } from "../in-memory-repository/product-in-memory-repository"

export function makeProducts(
    inMemoryProductRepository: ProductsInMemoryRepository,
    storeId: string,
    categoryId: string,
    subcategoryId: string
){
    return inMemoryProductRepository.create({
        name: faker.commerce.product(),
        slug: 'slug',
        description: faker.commerce.productDescription(),
        price: 179.90,
        stock: 177,
        tags: ['test'],
        categoryId,
        storeId,
        subcategoryId,
        status: 'INATIVO'
    })

}