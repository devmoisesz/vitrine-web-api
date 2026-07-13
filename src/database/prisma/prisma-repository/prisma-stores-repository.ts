import { UsersRepository } from '@/database/repositories/users-repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Store, User } from '@prisma/client';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class PrismaStoresRepository implements StoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StoreUncheckedCreateInput): Promise<Store> {
    return await this.prisma.store.create({
      data,
    });
  }

  async findByWhatsapp(whatsapp: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: {
        whatsapp,
      },
    });

    if (!store) return null;

    return store;
  }

  async findById(id: string): Promise<Store | null> {
    const user = await this.prisma.store.findUnique({
      where: {
        id,
      },
    });

    if (!user) return null;

    return user;
  }

  async findBySlug(slug: string): Promise<Store | null> {
    const user = await this.prisma.store.findUnique({
      where: {
        slug,
      },
    });

    if (!user) return null;

    return user;
  }
}
