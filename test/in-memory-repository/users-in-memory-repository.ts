import { UsersRepository } from '@/database/repositories/users-repository';
import { Prisma, User } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class UsersInMemoryRepository implements UsersRepository {
  public items: User[] = [];

  async save(user: User): Promise<User> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id);

    this.items[itemIndex] = user;

    return user
  }

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id)

    if (!user) return null

    return user
  }

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    const user = {
      id: data.id ?? randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password ?? null,
      role: data.role ?? 'Usuário'
    };

    this.items.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email)

    if (!user) return null

    return user
  }
}
