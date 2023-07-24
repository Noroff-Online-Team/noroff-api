import { z } from "zod"

export const loginSchema = z.object({
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string"
  })
})

export const authResponseSchema = z.object({
  accessToken: z.string()
})

export type LoginInput = z.infer<typeof loginSchema>
export type AuthSchema = z.infer<typeof authResponseSchema>
