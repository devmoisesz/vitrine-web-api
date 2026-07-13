import { randomUUID } from "node:crypto"
import { faker } from '@faker-js/faker'
import { AddressInMemoryRepository } from "../in-memory-repository/addresses-in-memory-repository"

export function makeUserAddress(
    inMemoryAddressRepository: AddressInMemoryRepository,
    userId: string,
){
    return inMemoryAddressRepository.create({
        id: randomUUID(),
        label: faker.word.noun(),
        userId,
        storeId: null,
        city: faker.location.city(),
        cep: faker.string.numeric(),
        neighborhood: faker.location.postalAddress(),
        state: faker.location.state()
    })

}