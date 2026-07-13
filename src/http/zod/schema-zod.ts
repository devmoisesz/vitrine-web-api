import z from 'zod';

export const createAccountBodySchema = z.object({
  name: z.string({ message: 'O nome é obrigatório' }).trim(),

  email: z
    .string({ message: 'O e-mail é obrigatório' })
    .email('Insira um endereço de e-mail válido'),

  password: z
    .string({ message: 'A senha é obrigatória' })
    .min(6, 'A senha deve conter no mínimo 6 caracteres'),
});

export type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

export const editUserDataBodySchema = z.object({
  name: z.string().trim().optional(),

  email: z
    .string().email('Insira um endereço de e-mail válido')
    .optional(),
});

export type editUserDataBodySchema = z.infer<typeof editUserDataBodySchema>;

export const authenticateBodySchema = z.object({
  email: z
    .string({ message: 'O e-mail é obrigatório' })
    .email('Insira um endereço de e-mail válido'),

  password: z
    .string({ message: 'A senha é obrigatória' })
    .min(6, 'A senha deve conter no mínimo 6 caracteres'),
});

export type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

export const registerCollaboratorBodySchema = z.object({
  name: z.string({ message: 'O nome do colaborador é obrigatório' }).trim(),

  email: z
    .string({ message: 'O e-mail é obrigatório' })
    .email('Insira um endereço de e-mail válido'),

  password: z
    .string({ message: 'A senha é obrigatória' })
    .min(6, 'A senha deve conter no mínimo 6 caracteres'),

  role: z.enum(['Proprietário', 'Funcionário'], {
    message: "O cargo deve ser 'Proprietário' ou 'Funcionário'",
  }),
});

export type RegisterCollaboratorBodySchema = z.infer<
  typeof registerCollaboratorBodySchema
>;

export const registerStoreBodySchema = z.object({
  store_name: z.string({ message: 'O nome da loja é obrigatório' }).trim(),

  store_email: z
    .string()
    .email('Insira um e-mail de loja válido')
    .optional()
    .or(z.literal('')),

  owner_email: z
    .string({ message: 'O e-mail do proprietário é obrigatório' })
    .email('Insira um e-mail de proprietário válido'),

  whatsapp: z
    .string({ message: 'O WhatsApp é obrigatório' })
    .min(10, 'Número de telefone incompleto')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => {
      return val.length === 10 || val.length === 11;
    }, 'O número de WhatsApp deve conter o DDD e um número válido (10 ou 11 dígitos).'),
});

export type RegisterStoreBodySchema = z.infer<typeof registerStoreBodySchema>;

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
