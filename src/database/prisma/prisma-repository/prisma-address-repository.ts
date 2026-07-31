import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Address, Prisma } from '@prisma/client';
import { AddressRepository } from '@/database/repositories/addresses-repository';

@Injectable()
export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

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
