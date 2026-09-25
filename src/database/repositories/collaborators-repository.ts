import { Collaborator, Prisma } from "@prisma/client"

export abstract class CollaboratorsRepository {
    abstract create(data: Prisma.CollaboratorUncheckedCreateInput): Promise<Collaborator>
    abstract findById(id: string): Promise<Collaborator | null>
    abstract findByIdAndStoreId(id: string, storeId: string): Promise<Collaborator | null>
    abstract findByUserId(userId: string): Promise<Collaborator | null>
    abstract findByUserAndStore(userId: string, storeId: string): Promise<Collaborator | null>
    abstract delete(id: string): Promise<void>
}
