import { StoresInMemoryRepository } from "../in-memory-repository/stores-in-memory-repository"
import { randomUUID } from "node:crypto"
import { faker } from '@faker-js/faker'
import { makeEmail } from "./make-email"

export function makeStore(
    inMemoryStoresRepository: StoresInMemoryRepository,
    override: Partial<any> = {},
){
    return inMemoryStoresRepository.create({
        id: randomUUID(),
        name: faker.person.fullName(),
        slug: 'slug-test',
        email: makeEmail(),
        description: faker.lorem.text(),
        whatsapp: faker.phone.imei(),
        ...override
    })

}