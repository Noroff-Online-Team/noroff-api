import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"
import { postSchema } from "../posts/posts.schema"

const profileMedia = {
  banner: z.string().url().nullable(),
  avatar: z.string().url().nullable()
}

const profileMediaSchema = z.object(profileMedia)

export const profileCore = {
  name: z.string().regex(/^[\w]+$/, "Name can only use a-Z, 0-9, and _"),
  email: z.string({
    invalid_type_error: "Email must be a string",
  }).email().regex(/^[\w\-.]+@(stud.)?noroff.no$/, "Only noroff.no emails are allowed to register"),
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

export const profileSchema = z.object({
  ...profileCore,
})

const followSchema = z.object({
  name: z.string(),
  avatar: z.string().url().nullable()
})

const profileFollows = {
  followers: followSchema.array().optional(),
  following: followSchema.array().optional(),
}

export const displayProfileSchema = z.object({
  ...profileCore,
  ...profileFollows,
  posts: postSchema.array().optional(),
  _count: z.object({
    posts: z.number().int().optional(),
    followers: z.number().int().optional(),
    following: z.number().int().optional(),
  }).optional()
})

export type ProfileSchema = z.infer<typeof profileSchema>

export type DisplayProfileSchema = z.infer<typeof displayProfileSchema>

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export type ProfileMediaSchema = z.infer<typeof profileMediaSchema>;

export const { schemas: profileSchemas, $ref } = buildJsonSchemas(
  { 
    profileSchema,
    createProfileSchema,
    createProfileResponseSchema,
    displayProfileSchema,
    profileMediaSchema
  },
  { $id: "Profiles" }
)
