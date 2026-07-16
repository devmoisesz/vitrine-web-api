import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { Collaborator, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class CollaboratorsInMemoryRepository implements CollaboratorsRepository {
  public items: Collaborator[] = [];

  async delete(userId: string): Promise<void> {
    const employee = this.items.findIndex((item) => item.userId === userId)

    this.items.splice(employee, 1)
  }

  async findManyEmployee(storeId: string): Promise<Collaborator[]> {
    return this.items.filter((item) => item.storeId === storeId && item.role === 'FUNCIONARIO')
  }

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
      role: data.role ?? 'FUNCIONARIO'
    };

    this.items.push(collaborator)

    return collaborator
  }
}
