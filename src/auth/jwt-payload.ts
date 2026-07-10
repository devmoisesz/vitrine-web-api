import { UserRole } from "@prisma/client"

export abstract class UserPayload {
    abstract sub: string
    abstract role: UserRole
}