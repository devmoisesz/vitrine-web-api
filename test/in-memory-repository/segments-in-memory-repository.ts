import { randomUUID } from 'node:crypto';
import type { Segment } from '@prisma/client';
import { SegmentsRepository } from '@/database/repositories/segments-repository';

export class SegmentsInMemoryRepository implements SegmentsRepository {
  items: Segment[] = [];
  associated = new Set<string>();
  async list() { return [...this.items].sort((a, b) => a.name.localeCompare(b.name)); }
  async findById(id: string) { return this.items.find(item => item.id === id) ?? null; }
  async countIds(ids: string[]) { return this.items.filter(item => ids.includes(item.id)).length; }
  async create(data: Pick<Segment, 'name' | 'slug'>) {
    this.checkDuplicate(data);
    const segment = { ...data, id: randomUUID() };
    this.items.push(segment);
    return segment;
  }
  async update(id: string, data: Pick<Segment, 'name' | 'slug'>) {
    const segment = await this.findById(id);
    if (!segment) throw { code: 'P2025' };
    this.checkDuplicate(data, id);
    Object.assign(segment, data);
    return segment;
  }
  async delete(id: string) {
    if (this.associated.has(id)) throw { code: 'P2003' };
    if (!await this.findById(id)) throw { code: 'P2025' };
    this.items = this.items.filter(item => item.id !== id);
  }
  private checkDuplicate(data: Pick<Segment, 'name' | 'slug'>, id?: string) {
    if (this.items.some(item => item.id !== id && (item.slug === data.slug || item.name.toLowerCase() === data.name.toLowerCase()))) throw { code: 'P2002' };
  }
}
