import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { SegmentsInMemoryRepository } from '../../../../test/in-memory-repository/segments-in-memory-repository';
import { SegmentsService } from './segments.service';

describe('Segment administration', () => {
  let repository: SegmentsInMemoryRepository;
  let service: SegmentsService;
  beforeEach(() => { repository = new SegmentsInMemoryRepository(); service = new SegmentsService(repository); });
  it('starts empty; creates a UUID and URL slug from the name without seeding', async () => {
    expect(await service.list()).toEqual([]);
    const segment = await service.save({ name: '  Cosméticos  naturais  ' });
    expect(segment).toEqual({ id: expect.any(String), name: 'Cosméticos naturais', slug: 'cosmeticos-naturais' });
    expect(await service.list()).toEqual([segment]);
  });
  it('edits names while preserving published slugs unless explicitly changed', async () => {
    const segment = await service.save({ name: 'Fitness' });
    await service.save({ name: 'Esportes' }, segment.id);
    expect(segment.slug).toBe('fitness');
    await service.save({ name: 'Esportes', slug: 'esportes' }, segment.id);
    expect(segment.slug).toBe('esportes');
  });
  it('rejects duplicate names (including case changes) and slugs', async () => {
    await service.save({ name: 'Fitness' });
    await expect(service.save({ name: 'FITNESS', slug: 'outro' })).rejects.toBeInstanceOf(ConflictException);
    await expect(service.save({ name: 'Outro', slug: 'fitness' })).rejects.toBeInstanceOf(ConflictException);
  });
  it.each([{ name: '' }, { name: '    ' }, { name: 'A', slug: '../a' }, { name: 'A', slug: 'A B' }])('rejects invalid input: %j', async input => {
    await expect(service.save(input)).rejects.toBeInstanceOf(BadRequestException);
  });
  it('blocks deletion while associated, but permits deletion after removal', async () => {
    const segment = await service.save({ name: 'Fitness' });
    repository.associated.add(segment.id);
    await expect(service.delete(segment.id)).rejects.toThrow('associado a lojas');
    expect(await service.list()).toHaveLength(1);
    repository.associated.clear();
    await service.delete(segment.id);
    expect(await service.list()).toHaveLength(0);
    await expect(service.delete(segment.id)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('accepts several existing segments, empty and omitted assignments; rejects duplicates and unknown IDs', async () => {
    const a = await service.save({ name: 'A' });
    const b = await service.save({ name: 'B' });
    await service.validateIds([a.id, b.id]);
    await service.validateIds([]);
    await service.validateIds(undefined);
    await expect(service.validateIds([a.id, a.id])).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.validateIds([randomUUID()])).rejects.toThrow('não existem');
  });
});
