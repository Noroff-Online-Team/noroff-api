import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

export const postCore = {
  title: z.string(),
  body: z.string(),
  tags: z.string().array().optional(),
  media: z.string().optional(),
}

export const postSchema = z.object({
  id: z.number().int(),
  ...postCore
})

export const createPostSchema = z.object({
  ...postCore,
  userId: z.number().int(),
})

export type PostSchema = z.infer<typeof postSchema>

export type CreatePostSchema = z.infer<typeof createPostSchema>

export const { schemas: postSchemas, $ref } = buildJsonSchemas(
  { postSchema, createPostSchema },
  { $id: "Posts" }
)
