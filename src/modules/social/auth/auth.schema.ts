import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const loginResponseSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  banner: z.string().url().nullable(),
  avatar: z.string().url().nullable(),
  accessToken: z.string()
})

export type LoginInput = z.infer<typeof loginSchema>
