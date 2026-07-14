import z from "zod";

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

export const authenticateBodySchema = z.object({
  email: z
    .string({ message: 'O e-mail é obrigatório' })
    .email('Insira um endereço de e-mail válido'),

  password: z
    .string({ message: 'A senha é obrigatória' })
    .min(6, 'A senha deve conter no mínimo 6 caracteres'),
});

export type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

export const editUserDataBodySchema = z.object({
  name: z.string().trim().optional(),

  email: z
    .string().email('Insira um endereço de e-mail válido')
    .optional(),
});

export type EditUserDataBodySchema = z.infer<typeof editUserDataBodySchema>;

export const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1));

export type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>