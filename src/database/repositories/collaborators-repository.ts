import { Collaborator, Prisma } from "@prisma/client"

export abstract class CollaboratorsRepository {
    abstract create(data: Prisma.CollaboratorUncheckedCreateInput): Promise<Collaborator>
    abstract findById(id: string): Promise<Collaborator | null>
    abstract findByUserId(userId: string): Promise<Collaborator | null>
}