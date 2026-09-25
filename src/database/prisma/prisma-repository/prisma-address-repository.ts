import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Address, Prisma } from '@prisma/client';
import {
  AddressRepository,
  type UserAddressUpdate,
} from '@/database/repositories/addresses-repository';

@Injectable()
export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdAndUserId(id: string, userId: string): Promise<Address | null> {
    if (!id || !userId) return null;

    return this.prisma.address.findFirst({
      where: { id, userId, storeId: null },
    });
  }

  async saveForUser(
    id: string,
    userId: string,
    data: UserAddressUpdate,
  ): Promise<Address | null> {
    if (!id || !userId) return null;

    try {
      return await this.prisma.address.update({
        where: { id, userId, AND: { storeId: null } },
        data: {
          label: data.label,
          cep: data.cep,
          state: data.state,
          city: data.city,
          neighborhood: data.neighborhood,
          street: data.street,
          number: data.number,
          complement: data.complement,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  async create(data: Prisma.AddressUncheckedCreateInput): Promise<Address> {
    return await this.prisma.address.create({
      data,
    });
  }

  async save(address: Address): Promise<Address> {
    return await this.prisma.address.update({
      where: {
        id: address.id,
      },
      data: {
        label: address.label,
        cep: address.cep,
        state: address.state,
        city: address.city,
        neighborhood: address.neighborhood,
        street: address.street,
        number: address.number,
        complement: address.complement,
      },
    });
  }

  async findByUserId(id: string): Promise<Address[]> {
    const user = await this.prisma.address.findMany({
      where: {
        userId: id,
      },
    });

    return user;
  }

  async findManyByUserId(
    userId: string,
    page: number,
  ): Promise<{ addresses: Address[]; total: number }> {
    const pageSize = 5;

    const where: Prisma.AddressWhereInput = {
      userId,
    };

    const [addresses, total] = await this.prisma.$transaction([
      this.prisma.address.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      this.prisma.address.count({ where }),
    ]);

    return { addresses, total };
  }

  async findByStoreId(storeId: string): Promise<Address | null> {
    const store = await this.prisma.address.findUnique({
      where: {
        storeId,
      },
    });

    return store;
  }

  async findById(id: string): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({
      where: {
        id: id,
      },
    });

    if (!address) return null;

    return address;
  }
}
