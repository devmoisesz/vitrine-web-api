import { CollaboratorsInMemoryRepository } from "../in-memory-repository/collaborators-in-memory-repository"

export function makeCollaborator(
    inMemoryCollaboratorsRepository: CollaboratorsInMemoryRepository,
    userId: string,
    storeId: string,
    role: 'FUNCIONARIO' | 'PROPRIETARIO'  
){
    return inMemoryCollaboratorsRepository.create({
        userId,
        storeId,
        role,
    })

}