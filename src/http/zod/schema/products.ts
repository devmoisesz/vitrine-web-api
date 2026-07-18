import z from 'zod';

export const registerProductBodySchema = z.object({
  name_product: z
    .string({ message: 'Informe nome do produto.' })
    .trim()
    .min(1, 'Informe nome do produto.'),

  tags: z
    .array(z.string().trim()
        .min(1, 'Uma das tags está vazia.')
        .max(30, 'Cada tag deve ter no máximo 30 caracteres.'),
    )
    .min(1, 'Informe pelo menos uma tag.')
    .max(10, 'É permitido informar no máximo 10 tags.'),

  description: z
    .string({ message: 'Informe a descrição do produto.' })
    .trim()
    .min(1, 'Informe a descrição do produto.'),

  price: z
    .number({ message: 'Informe preço do produto.' })
    .positive('O preço deve ser maior que R$ 0,00.'),

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

export type RegisterProductBodySchema = z.infer<
  typeof registerProductBodySchema
>;
