import z from "zod";

export const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

export const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>