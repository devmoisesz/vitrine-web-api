import z from 'zod';

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

export const paymentMethodEnum = z.enum([
  'PIX',
  'DINHEIRO',
  'CARTAO_ENTREGA',
  'CARTAO_ONLINE',
]);

export const deliveryMethodEnum = z.enum([
  'RETIRADA_LOJA',
  'ENTREGA_PROPRIA',
  'CORREIOS',
  'MOTOBOY',
]);

export const editStoreDataBodySchema = z.object({
  newName: z.string().trim().optional(),

  newEmail: z
    .string()
    .email('Insira um e-mail de loja válido')
    .optional()
    .or(z.literal('')),

  newWhatsapp: z
    .string()
    .min(10, 'Número de telefone incompleto')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => {
      return val.length === 10 || val.length === 11;
    }, 'O número de WhatsApp deve conter o DDD e um número válido (10 ou 11 dígitos).')
    .optional(),

  newDescription: z.string().trim().optional(),

  newPaymentMethods: z.array(paymentMethodEnum).optional(),
  newDeliveryMethods: z.array(deliveryMethodEnum).optional(),
});

export type RegisterStoreBodySchema = z.infer<typeof registerStoreBodySchema>;

export type EditStoreDataBodySchema = z.infer<typeof editStoreDataBodySchema>;
