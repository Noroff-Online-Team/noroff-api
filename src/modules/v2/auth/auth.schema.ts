import { z } from "zod"

export const loginBodySchema = z.object({
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
  avatar: z.string().url().nullable().or(z.literal("")),
  banner: z.string().url().nullable().or(z.literal("")),
  accessToken: z.string()
})

export const profileMedia = {
  avatar: z
    .string({
      invalid_type_error: "Avatar must be a string"
    })
    .url("Avatar must be valid URL")
    .nullish()
    .or(z.literal("")),
  banner: z
    .string({
      invalid_type_error: "Banner must be a string"
    })
    .url("Banner must be valid URL")
    .nullish()
    .or(z.literal(""))
}

export const profileCore = {
  name: z
    .string()
    .regex(/^[\w]+$/, "Name can only use a-Z, 0-9, and _")
    .max(20, "Name cannot be greater than 20 characters")
    .trim(),
  email: z
    .string({
      invalid_type_error: "Email must be a string"
    })
    .email()
    .regex(/^[\w\-.]+@(stud\.)?noroff\.no$/, "Only stud.noroff.no emails are allowed to register")
    .trim(),
  ...profileMedia
}

export const createProfileBodySchema = z.object({
  ...profileCore,
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string"
    })
    .min(8, "Password must be at least 8 characters")
})

export const createProfileResponseSchema = z.object({
  id: z.number(),
  ...profileCore
})

export const profileMediaSchema = z.object(profileMedia)

export type LoginInput = z.infer<typeof loginBodySchema>
export type CreateProfileInput = z.infer<typeof createProfileBodySchema>
