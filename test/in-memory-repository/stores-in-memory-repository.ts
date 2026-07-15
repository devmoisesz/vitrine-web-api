import { StoresRepository } from '@/database/repositories/stores-repository';
import { Prisma, Store } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class StoresInMemoryRepository implements StoresRepository {
  public items: Store[] = [];

  async disable(id: string ): Promise<void> {
     const store = this.items.find((item) => item.id === id && item.status === 'Ativa')

    if(!store){
      return
    }

     store.status = 'Inativa'
  }

  async findByWhatsapp(whatsapp: string): Promise<Store | null> {
    const store = this.items.find((item) => item.whatsapp === whatsapp);

    if (!store) return null;

    return store;
  }

  async findById(id: string): Promise<Store | null> {
    const store = this.items.find((item) => item.id === id);

    if (!store) return null;

    return store;
  }

  async findBySLugAndEmail(slug: string, email: string): Promise<Store | null> {
    const store = this.items.find(
      (item) => item.slug === slug && item.email === email,
    );

    if (!store) return null;

    return store;
  }

  async findBySlug(slug: string) {
    const store = this.items.find((item) => {
      const itemSlug = typeof item.slug === 'string' ? item.slug : item.slug;
      return itemSlug === slug;
    });

    if (!store) {
      return null;
    }

    return store;
  }

  async create(data: Prisma.StoreUncheckedCreateInput): Promise<Store> {
    const store = {
      id: data.id ?? randomUUID(),
      name: data.name,
      slug: data.slug,
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

  async save(store: Store): Promise<Store> {
    const itemIndex = this.items.findIndex((item) => item.id === store.id);

    this.items[itemIndex] = store;

    return store;
  }
}
