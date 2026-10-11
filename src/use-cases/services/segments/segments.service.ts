import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SegmentsRepository } from '@/database/repositories/segments-repository';
import { segmentBodySchema, segmentIdsSchema, segmentSlugSchema, type SegmentBody } from '@/http/zod/schema/segments';

@Injectable()
export class SegmentsService {
  constructor(private segments: SegmentsRepository) {}

  list() { return this.segments.list(); }

  async validateIds(ids: string[] | undefined) {
    if (ids === undefined) return;
    if (!segmentIdsSchema.safeParse(ids).success) {
      throw new BadRequestException('Informe segmentos válidos, sem repetições.');
    }
    if (ids.length && await this.segments.countIds(ids) !== ids.length) {
      throw new BadRequestException('Um ou mais segmentos não existem. Atualize a lista e tente novamente.');
    }
  }

  async save(input: SegmentBody, id?: string) {
    const parsed = segmentBodySchema.safeParse(input);
    if (!parsed.success) throw new BadRequestException('Informe um nome e um slug válidos.');
    const data = parsed.data;
    const existing = id ? await this.segments.findById(id) : null;
    if (id && !existing) throw new NotFoundException('Segmento não encontrado.');
    const slug = data.slug ?? existing?.slug ?? data.name.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!segmentSlugSchema.safeParse(slug).success) {
      throw new BadRequestException('Informe um slug com letras minúsculas, números e hífens.');
    }
    try {
      return id ? await this.segments.update(id, { name: data.name, slug })
        : await this.segments.create({ name: data.name, slug });
    } catch (error) { this.handleError(error); }
  }

  async delete(id: string) {
    try { await this.segments.delete(id); }
    catch (error) { this.handleError(error); }
  }

  private handleError(error: unknown): never {
    const code = (error as { code?: string })?.code;
    if (code === 'P2002') throw new ConflictException('Já existe um segmento com esse nome ou slug.');
    if (code === 'P2003') throw new ConflictException('Este segmento está associado a lojas. Remova as associações antes de excluí-lo.');
    if (code === 'P2025') throw new NotFoundException('Segmento não encontrado.');
    throw error;
  }
}
