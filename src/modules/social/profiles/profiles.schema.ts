import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"
import { postSchema } from "../posts/posts.schema"

const profileMedia = {
  banner: z.string().optional(),
  avatar: z.string().optional()
}

const profileMediaSchema = z.object(profileMedia)

export const profileCore = {
  name: z.string().regex(/^[\w]+$/, "Name can only use a-Z, 0-9, and _"),
  email: z.string({
    invalid_type_error: "Email must be a string",
  }).email().regex(/^[\w\-.]+@noroff.no$/, "Only noroff.no emails are allowed to register"),
  ...profileMedia
}

export const createProfileSchema = z.object({
  ...profileCore,
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }).min(8, "Password must be at least 8 characters"),
});

export const createProfileResponseSchema = z.object({
  id: z.number(),
  ...profileCore,
});

export const displayProfileSchema = z.object({
  ...profileCore,
  id: z.number().int(),
  posts: postSchema.array().optional(),
})

export const profileSchema = z.object({
  ...profileCore,
  id: z.number().int()
})

export type ProfileSchema = z.infer<typeof profileSchema>

export type DisplayProfileSchema = z.infer<typeof displayProfileSchema>

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export type ProfileMediaSchema = z.infer<typeof profileMediaSchema>;

export const { schemas: profileSchemas, $ref } = buildJsonSchemas(
  { profileSchema,
    createProfileSchema,
    createProfileResponseSchema,
    displayProfileSchema,
    profileMediaSchema },
  { $id: "Profiles" }
)
