import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { Collaborator, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { UsersInMemoryRepository } from './users-in-memory-repository';

export class CollaboratorsInMemoryRepository implements CollaboratorsRepository {
  public items: Collaborator[] = [];

  async findById(id: string): Promise<Collaborator | null> {
    const collaborator = this.items.find((item) => item.id === id)

    if (!collaborator) return null

    return collaborator
  }

  async findByUserId(userId: string): Promise<Collaborator | null> {
    const collaborator = this.items.find((item) => item.userId === userId)

    if (!collaborator) return null

    return collaborator
  }

  async create(data: Prisma.CollaboratorUncheckedCreateInput): Promise<Collaborator> {
    const collaborator = {
      id: data.id ?? randomUUID(),
      userId: data.userId,
      storeId: data.storeId,
      role: data.role ?? 'Funcionário'
    };

    this.items.push(collaborator)

    return collaborator
  }
}
