import z from "zod";

export const registerCategoryBodySchema = z.object({
  name: z.string({ message: 'O nome da categooria é obrigatório' }).trim(),
});

export type RegisterCategoryBodySchema = z.infer<
  typeof registerCategoryBodySchema
>;