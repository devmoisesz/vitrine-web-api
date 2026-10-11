import z from 'zod';

export const segmentSlugSchema = z.string().trim().min(1).max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens no slug.');

export const segmentBodySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do segmento.').max(100)
    .transform((name) => name.replace(/\s+/g, ' ')),
  slug: segmentSlugSchema.optional(),
});
export type SegmentBody = z.infer<typeof segmentBodySchema>;

export const segmentIdsSchema = z.array(z.uuid()).max(100)
  .refine((ids) => new Set(ids).size === ids.length, 'Não repita segmentos.');

export const storesQuerySchema = z.object({
  name: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  segments: z.string().max(10100).optional().default('')
    .transform((value) => [...new Set(value.split(',').filter(Boolean))])
    .pipe(z.array(segmentSlugSchema).max(100)),
});
export type StoresQuery = z.infer<typeof storesQuerySchema>;
