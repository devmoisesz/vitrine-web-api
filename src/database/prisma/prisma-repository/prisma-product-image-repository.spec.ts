import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.service';
import { PrismaProductsImagesRepository } from './prisma-product-image-repository';

describe('PrismaProductsImagesRepository', () => {
  it('returns null for a missing image so the service can reject it before deletion', async () => {
    const prisma = {
      productImages: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const repository = new PrismaProductsImagesRepository(
      prisma as unknown as PrismaService,
    );

    await expect(repository.findById('missing')).resolves.toBeNull();
  });
});
