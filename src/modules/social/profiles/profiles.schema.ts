import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"
import { postSchema } from "../posts/posts.schema"

export const profileCore = {
  name: z.string(),
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
  .email(),
  avatar: z.string().optional()
}

export const createProfileSchema = z.object({
  ...profileCore,
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
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

export const { schemas: profileSchemas, $ref } = buildJsonSchemas(
  { profileSchema,
    createProfileSchema,
    createProfileResponseSchema,
    displayProfileSchema },
  { $id: "Profiles" }
)
