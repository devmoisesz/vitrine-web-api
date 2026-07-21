import { StoresRepository } from '@/database/repositories/stores-repository';
import { Prisma, Store } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class StoresInMemoryRepository implements StoresRepository {
  public items: Store[] = [];

  async findMany(page: number, name?: string): Promise<Store[]> {
    const pageSize = 40;

    let filteredStores = this.items.filter((store) => store.status === 'ATIVA');

    if (name) {
      const searchTerm = name.toLocaleLowerCase();

      filteredStores = filteredStores.filter((store) => {
        const nameMatch = store.name.toLocaleLowerCase().includes(searchTerm);
        const descriptionMatch = store.description
          ? store.description.toLocaleLowerCase().includes(searchTerm)
          : false;

        return nameMatch || descriptionMatch;
      });
    }

    filteredStores.sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return filteredStores.slice(
      (page - 1) * pageSize,
      page * pageSize
    )
  }

  async disable(slug: string): Promise<void> {
    const store = this.items.find(
      (item) => item.slug === slug && item.status === 'ATIVA',
    );

    if (!store) {
      return;
    }

    store.status = 'INATIVA';
  }

  async activate(slug: string): Promise<void> {
    const store = this.items.find(
      (item) => item.slug === slug && item.status === 'INATIVA',
    );

    if (!store) {
      return;
    }

    store.status = 'ATIVA';
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
      status: data.status ?? 'ATIVA',
      logo_image_url: data.logo_image_url || null,
      storage_public_id: data.storage_public_id || null,
      createdAt: new Date()
    };

    this.items.push(store);

    return store;
  }

  async save(store: Store): Promise<Store> {
    const itemIndex = this.items.findIndex((item) => item.id === store.id);

    this.items[itemIndex] = store;

    return store;
  }

  async saveImage(id: string, url: string, public_id: string): Promise<void> {
    const store = this.items.find((item) => item.id === id);

    if (!store) return;

    store.logo_image_url = url;
    store.storage_public_id = public_id;
  }
}
