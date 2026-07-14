import { Prisma, User } from "@prisma/client"

export abstract class UsersRepository {
    abstract create(data: Prisma.UserUncheckedCreateInput): Promise<User>
    abstract save(user: User): Promise<User>
    abstract findByEmail(email: string): Promise<User | null>
    abstract findById(id: string): Promise<User | null>
    abstract findManyById(ids: string[], page: number): Promise<User[]>
}