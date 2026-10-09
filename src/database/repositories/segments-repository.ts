import type { Segment } from '@prisma/client';

export abstract class SegmentsRepository {
  abstract list(): Promise<Segment[]>;
  abstract findById(id: string): Promise<Segment | null>;
  abstract countIds(ids: string[]): Promise<number>;
  abstract create(data: Pick<Segment, 'name' | 'slug'>): Promise<Segment>;
  abstract update(id: string, data: Pick<Segment, 'name' | 'slug'>): Promise<Segment>;
  abstract delete(id: string): Promise<void>;
}
