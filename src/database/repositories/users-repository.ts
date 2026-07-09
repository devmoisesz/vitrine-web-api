import { Prisma, User } from "@prisma/client"

export abstract class UsersRepository {
    abstract create(data: Prisma.UserCreateInput): Promise<User>
    abstract findByEmail(email: string): Promise<User | null>
}