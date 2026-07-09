import { StoresInMemoryRepository } from "../in-memory-repository/stores-in-memory-repository"
import { randomUUID } from "node:crypto"
import { faker } from '@faker-js/faker'
import { InputCreateAccountDto } from "@/use-cases/services/users/dtos/create-account.dto"
import { UsersInMemoryRepository } from "../in-memory-repository/users-in-memory-repository"

export async function makeUser(
    inMemoryUsersRepository: UsersInMemoryRepository,
    override: Partial<InputCreateAccountDto> = {},
){
    return inMemoryUsersRepository.create({
        id: randomUUID(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        ...override
    })

}