import z from 'zod';

const tagSchema = z
  .string()
  .trim()
  .min(1, 'Uma das tags está vazia.')
  .max(30, 'Cada tag deve ter no máximo 30 caracteres.');

export const ALLOWED_SIZES = [
  'PP',
  'P',
  'M',
  'G',
  'GG',
  'XGG',
  'EG',
  'EGG',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  'U',
  'ÚNICO',
] as const;

export const registerProductBodySchema = z.object({
  name_product: z
    .string({ message: 'Informe nome do produto.' })
    .trim()
    .min(1, 'Informe nome do produto.'),

  tags: z
    .array(tagSchema)
    .min(1, 'Informe pelo menos uma tag.')
    .max(10, 'É permitido informar no máximo 10 tags.'),

  description: z
    .string({ message: 'Informe a descrição do produto.' })
    .trim()
    .min(1, 'Informe a descrição do produto.'),

  price: z
    .number({ message: 'Informe preço do produto.' })
    .positive('O preço deve ser maior que R$ 0,00.'),

  sizes: z
    .array(
      z.enum(ALLOWED_SIZES, {
        message:
          'Tamanho inválido. Informe tamanhos válidos (ex: P, M, G, 38, 40).',
      }),
    )
    .optional()
    .default([]),

  stock: z
    .number({ message: 'Informe a quantidade de estoque do produto.' })
    .positive('A quantidade do estoque tem que ser positivo.'),

  name_category: z
    .string({ message: 'Informe uma categoria.' })
    .trim()
    .min(1, 'Informe uma categoria.'),

  name_subcategory: z
    .string({ message: 'Informe uma subcategoria.' })
    .trim()
    .min(1, 'Informe uma subcategoria.'),
});

export const editProductBodySchema = z.object({
  newNameProduct: z
    .string()
    .trim()
    .min(1, 'Informe nome do produto.')
    .optional(),
  newTags: z
    .array(tagSchema)
    .max(10, 'É permitido informar no máximo 10 tags.')
    .optional(),
  newDescription: z
    .string()
    .trim()
    .min(1, 'Informe a descrição do produto.')
    .optional(),
  newPrice: z
    .number({ message: 'Informe preço do produto.' })
    .positive('O preço deve ser maior que R$ 0,00.')
    .optional(),

  newSizes: z
    .array(
      z.enum(ALLOWED_SIZES, {
        message:
          'Tamanho inválido. Informe tamanhos válidos (ex: P, M, G, 38, 40).',
      }),
    )
    .optional(),

  newStock: z
    .number({ message: 'Informe a quantidade de estoque do produto.' })
    .positive('A quantidade do estoque tem que ser positivo.')
    .optional(),
  newCategory: z.string().trim().min(1, 'Informe uma categoria.').optional(),
  newSubcategory: z
    .string()
    .trim()
    .min(1, 'Informe uma subcategoria.')
    .optional(),
});

export type RegisterProductBodySchema = z.infer<
  typeof registerProductBodySchema
>;
export type EditProductBodySchema = z.infer<typeof editProductBodySchema>;
