import z from "zod";

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