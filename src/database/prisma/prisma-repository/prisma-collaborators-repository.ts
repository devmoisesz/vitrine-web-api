import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Collaborator, Prisma } from '@prisma/client';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';

@Injectable()
export class PrismaCollaboratorsRepository implements CollaboratorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async delete(id: string): Promise<void> {
    await this.prisma.collaborator.delete({
      where: {
        id
      }
    }) 
  }

  async create(
    data: Prisma.CollaboratorUncheckedCreateInput,
  ): Promise<Collaborator> {
    return await this.prisma.collaborator.create({
      data: {
        userId: data.userId,
        storeId: data.storeId,
      },
    });
  }

  async findByUserId(id: string): Promise<Collaborator | null> {
    const collaborator = await this.prisma.collaborator.findUnique({
      where: {
        userId: id,
      },
    });

    if (!collaborator) return null;

    return collaborator;
  }

  async findById(id: string): Promise<Collaborator | null> {
    const collaborator = await this.prisma.collaborator.findUnique({
      where: {
        id: id,
      },
    });

    if (!collaborator) return null;

    return collaborator;
  }
}
