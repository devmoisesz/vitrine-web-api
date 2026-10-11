import { Injectable } from '@nestjs/common';
import type { Segment } from '@prisma/client';
import { SegmentsRepository } from '@/database/repositories/segments-repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSegmentsRepository implements SegmentsRepository {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.segment.findMany({ orderBy: [{ name: 'asc' }, { id: 'asc' }] });
  }
  findById(id: string) { return this.prisma.segment.findUnique({ where: { id } }); }
  countIds(ids: string[]) { return this.prisma.segment.count({ where: { id: { in: ids } } }); }
  create(data: Pick<Segment, 'name' | 'slug'>) { return this.prisma.segment.create({ data }); }
  update(id: string, data: Pick<Segment, 'name' | 'slug'>) {
    return this.prisma.segment.update({ where: { id }, data });
  }
  async delete(id: string) {
    // The restrictive foreign key also protects against concurrent assignments.
    await this.prisma.segment.delete({ where: { id } });
  }
}
