import {
  AddressRepository,
  type UserAddressUpdate,
} from '@/database/repositories/addresses-repository';
import { Address, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class AddressInMemoryRepository implements AddressRepository {
  public items: Address[] = [];

  async findByIdAndUserId(id: string, userId: string): Promise<Address | null> {
    if (!id || !userId) return null;

    return (
      this.items.find(
        (item) =>
          item.id === id && item.userId === userId && item.storeId === null,
      ) ?? null
    );
  }

  async saveForUser(
    id: string,
    userId: string,
    data: UserAddressUpdate,
  ): Promise<Address | null> {
    if (!id || !userId) return null;

    const index = this.items.findIndex(
      (item) =>
        item.id === id && item.userId === userId && item.storeId === null,
    );
    if (index === -1) return null;

    const address = {
      ...this.items[index],
      label: data.label,
      cep: data.cep,
      state: data.state,
      city: data.city,
      neighborhood: data.neighborhood,
      street: data.street,
      number: data.number,
      complement: data.complement,
      updatedAt: new Date(),
    };
    this.items[index] = address;
    return address;
  }

  async findById(id: string): Promise<Address | null> {
    const address = this.items.find((item) => item.id === id);

    if (!address) return null;

    return address;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const address = this.items.filter((item) => item.userId === userId);

    return address;
  }

  async findManyByUserId(
    userId: string,
    page: number,
  ): Promise<{ addresses: Address[]; total: number }> {
    const addresses = this.items
      .filter((item) => item.userId === userId)
      .slice((page - 1) * 5);

    const total = addresses.length;

    return { addresses, total };
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
      updatedAt: new Date(),
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
