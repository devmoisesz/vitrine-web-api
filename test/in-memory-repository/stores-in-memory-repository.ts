import { StoresRepository } from '@/database/repositories/stores-repository';
import { UsersRepository } from '@/database/repositories/users-repository';
import { Slug } from '@/use-cases/types/slug';
import { Prisma, Store, User } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class StoresInMemoryRepository implements StoresRepository {
  public items: Store[] = [];

  async findById(id: string): Promise<Store | null> {
    const store = this.items.find((item) => item.id === id)

    if (!store) return null

    return store
  }

  async create(data: Prisma.StoreUncheckedCreateInput): Promise<Store> {
    const store = {
      id: data.id ?? randomUUID(),
      name: data.name,
      slug: Slug.createFromText(data.name),
      description: data.description,
      whatsapp: data.whatsapp,
      status: data.status ?? 'Ativa'
    };

    this.items.push(store);

    return store;
  }
}
