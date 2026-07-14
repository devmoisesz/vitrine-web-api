import { randomUUID } from "node:crypto"
import { faker } from '@faker-js/faker'
import { AddressInMemoryRepository } from "../in-memory-repository/addresses-in-memory-repository"

export function makeStoreAddress(
    inMemoryAddressRepository: AddressInMemoryRepository,
    storeId: string,
){
    return inMemoryAddressRepository.create({
        id: randomUUID(),
        label: faker.word.noun(),
        userId: null,
        storeId,
        city: faker.location.city(),
        cep: faker.string.numeric(),
        neighborhood: faker.location.postalAddress(),
        state: faker.location.state()
    })

}