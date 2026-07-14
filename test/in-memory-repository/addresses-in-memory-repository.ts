import { AddressRepository } from '@/database/repositories/addresses-repository';
import { Address, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class AddressInMemoryRepository implements AddressRepository {
  public items: Address[] = [];

  async findById(id: string): Promise<Address | null> {
    const address = this.items.find((item) => item.id === id);

    if (!address) return null;

    return address;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const address = this.items.filter((item) => item.userId === userId);

    return address;
  }

  async findManyByUserId(userId: string, page: number): Promise<Address[]> {
    const address = this.items
    .filter((item) => item.userId === userId)
    .slice((page -1) * 5)

    return address;
  }

  async findByStoreId(storeId: string): Promise<Address | null> {
    const store = this.items.find((item) => item.storeId === storeId);

    if (!store) return null;

    return store;
  }

  async create(data: Prisma.AddressUncheckedCreateInput): Promise<Address> {
    const address = {
      number: data.number || null,
      id: data.id ?? randomUUID(),
      label: data.label ?? null,
      userId: data.userId || null,
      storeId: data.storeId || null,
      cep: data.cep || null,
      state: data.state,
      city: data.city,
      neighborhood: data.neighborhood,
      street: data.street || null,
      complement: data.complement || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.items.push(address);

    return address;
  }

  async save(address: Address): Promise<Address> {
    const itemIndex = this.items.findIndex((item) => item.id === address.id);

    this.items[itemIndex] = address;

    return address;
  }
}
