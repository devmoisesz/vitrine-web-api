import { StoresInMemoryRepository } from "../in-memory-repository/stores-in-memory-repository"
import { randomUUID } from "node:crypto"
import { faker } from '@faker-js/faker'
import { AddressInMemoryRepository } from "../in-memory-repository/addresses-in-memory-repository"
import { InputAddressDto } from "@/use-cases/services/address/dto/register-address.dto"

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