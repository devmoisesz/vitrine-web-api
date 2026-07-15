import { UsersRepository } from '@/database/repositories/users-repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEmployeesByStoreId(storeId: string, page: number): Promise<User[]> {
    const itemsPerPage = 10;

    return this.prisma.user.findMany({
      where: {
        collaborator: {
          storeId,
          role: 'FUNCIONARIO', 
        },
      },
      take: itemsPerPage,
      skip: (page - 1) * itemsPerPage,
    });
  }

  async findManyById(ids: string[], page: number): Promise<User[]> {
    const perPage = 5;

    return await this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });
  }

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
  }

  async save(user: User): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: user.name,
        email: user.email,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return null;

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) return null;

    return user;
  }
}
