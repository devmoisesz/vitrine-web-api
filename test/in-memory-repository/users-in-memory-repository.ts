import { UsersRepository } from '@/database/repositories/users-repository';
import { Prisma, User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { CollaboratorsInMemoryRepository } from './collaborators-in-memory-repository';

export class UsersInMemoryRepository implements UsersRepository {
  public items: User[] = [];

  constructor(
    private collaboratorsRepository?: CollaboratorsInMemoryRepository,
  ) {}

  async findEmployeesByStoreId(storeId: string, page: number): Promise<User[]> {
    if (!this.collaboratorsRepository) {
      throw new Error(
        'CollaboratorsInMemoryRepository is required to find employees by store ID.',
      );
    }

    const storeCollaborators = this.collaboratorsRepository.items.filter(
      (collaborator) =>
        collaborator.storeId === storeId && collaborator.role === 'FUNCIONARIO',
    );

    const employeeUserIds = storeCollaborators.map((c) => c.userId);

    const itemsPerPage = 5; 
    const employees = this.items
      .filter((user) => employeeUserIds.includes(user.id))
      .slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return employees;
  }

  async findManyById(ids: string[], page: number): Promise<User[]> {
    return this.items
      .filter((user) => ids.includes(user.id))
      .slice((page - 1) * 5);
  }

  async save(user: User): Promise<User> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id);

    this.items[itemIndex] = user;

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id);

    if (!user) return null;

    return user;
  }

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    const user = {
      id: data.id ?? randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password ?? null,
      role: data.role ?? 'USER',
    };

    this.items.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);

    if (!user) return null;

    return user;
  }
}
