import { Collaborator, Prisma } from "@prisma/client"

export abstract class CollaboratorsRepository {
    abstract create(data: Prisma.CollaboratorCreateInput): Promise<Collaborator>
}