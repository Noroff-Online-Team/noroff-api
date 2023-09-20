import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string"
    })
    .email("Email must be a valid email"),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string"
  })
})

export const loginResponseSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  banner: z.string().url().nullable().or(z.literal("")),
  avatar: z.string().url().nullable().or(z.literal("")),
  accessToken: z.string()
})

export type LoginInput = z.infer<typeof loginSchema>
