import { z } from "zod"

export const mediaProperties = {
  url: z.string().url(),
  alt: z.string().optional().default("")
}

export const mediaPropertiesWithErrors = {
  url: z
    .string({
      required_error: "Image URL is required",
      invalid_type_error: "Image URL must be a string"
    })
    .url("Image URL must be valid URL"),
  alt: z
    .string({
      invalid_type_error: "Image alt text must be a string"
    })
    .max(120, "Image alt text cannot be greater than 120 characters")
    .optional()
    .default("")
}

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
  bio: z.string().nullish(),
  avatar: z.object(mediaProperties).optional(),
  banner: z.object(mediaProperties).optional(),
  accessToken: z.string()
})

export const profileMedia = {
  avatar: z.object(mediaPropertiesWithErrors).optional(),
  banner: z.object(mediaPropertiesWithErrors).optional()
}

export const profileCore = {
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string"
    })
    .regex(/^[\w]+$/, "Name can only use a-Z, 0-9, and _")
    .max(20, "Name cannot be greater than 20 characters")
    .trim(),
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string"
    })
    .email()
    .regex(/^[\w\-.]+@(stud\.)?noroff\.no$/, "Only stud.noroff.no emails are allowed to register")
    .trim(),
  bio: z.string().max(160, "Bio cannot be greater than 160 characters").trim().nullish(),
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

export const createProfileResponseSchema = z.object(profileCore)

export const profileMediaSchema = z.object(profileMedia)

export const createApiKeySchema = z
  .object({
    name: z
      .string({ invalid_type_error: "Name must be a string" })
      .max(32, "Name cannot be greater than 32 characters")
      .optional()
  })
  .nullish()

export const createApiKeyResponseSchema = z.object({
  name: z.string(),
  status: z.string(),
  key: z.string().uuid()
})

export type LoginInput = z.infer<typeof loginBodySchema>
export type CreateProfileInput = z.infer<typeof createProfileBodySchema>
export type CreateAPIKeyInput = z.infer<typeof createApiKeySchema>
