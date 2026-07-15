import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Store } from '@prisma/client';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class PrismaStoresRepository implements StoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StoreUncheckedCreateInput): Promise<Store> {
    return await this.prisma.store.create({
      data,
    });
  }

  async save(store: Store): Promise<Store> {
    return await this.prisma.store.update({
      where: {
        id: store.id,
      },
      data: {
        ...store
      },
    });
  }

  async disable(slug: string): Promise<void> {
    await this.prisma.store.update({
      where: {
        slug,
      },
      data: {
        status: 'Inativa'
      },
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

  async findBySLugAndEmail(slug: string, email: string): Promise<Store | null> {
    const user = await this.prisma.store.findUnique({
      where: {
        slug,
        email
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
