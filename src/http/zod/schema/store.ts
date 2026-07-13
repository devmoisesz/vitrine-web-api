import z from "zod";

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
