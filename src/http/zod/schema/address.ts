import z from 'zod';

export const registerAddressBodySchema = z.object({
  label: z
    .string({ message: 'Informe um nome para identificar este endereço.' })
    .trim()
    .min(1, 'Informe um nome para identificar este endereço.'),

  cep: z.string().trim().optional(),

  state: z
    .string({ message: "'Informe o estado." })
    .trim()
    .min(1, 'Informe o estado.'),

  city: z
    .string({ message: 'Informe a cidade.' })
    .trim()
    .min(1, 'Informe a cidade.'),

  neighborhood: z
    .string({ message: 'Informe o bairro.' })
    .trim()
    .min(1, 'Informe o bairro.'),

  street: z.string().trim().optional(),

  number: z.string().trim().optional(),

  complement: z.string().trim().optional(),
});

export type RegisterAddressBodySchema = z.infer<
  typeof registerAddressBodySchema
>;

export const updateAddressBodySchema = z.object({
  label: z
    .string('Digite um texto')
    .trim()
    .min(1, 'Informe um nome para identificar este endereço.')
    .optional(),

  cep: z.string().trim().optional(),

  state: z.string().trim().min(1, 'Informe o estado.').optional(),

  city: z
    .string({ message: 'Informe a cidade.' })
    .trim()
    .min(1, 'Informe a cidade.')
    .optional(),

  neighborhood: z
    .string({ message: 'Informe o bairro.' })
    .trim()
    .min(1, 'Informe o bairro.')
    .optional(),

  street: z.string().trim().optional(),

  number: z.string().trim().optional(),

  complement: z.string().trim().optional(),
});

export type UpdateAddressBodySchema = z.infer<
  typeof updateAddressBodySchema
>;
