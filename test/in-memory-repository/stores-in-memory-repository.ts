import { StoresRepository } from '@/database/repositories/stores-repository';
import { Slug } from '@/use-cases/types/slug';
import { Prisma, Store } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { string } from 'zod';

export class StoresInMemoryRepository implements StoresRepository {
  public items: Store[] = [];

  async findByWhatsapp(whatsapp: string): Promise<Store | null> {
    const store = this.items.find((item) => item.whatsapp === whatsapp)

    if (!store) return null

    return store
  }

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
      email: data.email || null,
      description: data.description || null,
      whatsapp: data.whatsapp,
      cnpj: data.cnpj || null,
      cpf: data.cpf || null,
      status: data.status ?? 'Ativa',
      logo_image_url: data.logo_image_url || null,
      storage_public_id: data.storage_public_id || null,

    };

    this.items.push(store);

    return store;
  }
}
