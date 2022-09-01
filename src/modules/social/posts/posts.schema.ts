import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

export const postCore = {
  title: z.string(),
  body: z.string(),
  tags: z.string().array().optional(),
  media: z.string().optional(),
}

const postMeta = {
  created: z.date(),
  updated: z.date(),
}

const reactionSchema = z.object({
  symbol: z.string(),
  count: z.number().int(),
  postId: z.number().int(),
  message: z.string().optional()
})

const reactions = {
  reactions: reactionSchema.array().optional()
}

export const postSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  ...postMeta,
  ...postCore
})

export const createPostBaseSchema = z.object({
  ...postCore,
})

export const createPostSchema = z.object({
  userId: z.number().int(),
  ...postCore,
})

export const displayPostSchema = z.object({
  ...postCore,
  ...reactions,
  ...postMeta,
  id: z.number().int(),
  userId: z.number().int(),
})

export type PostSchema = z.infer<typeof postSchema>

export type CreatePostSchema = z.infer<typeof createPostSchema>

export type CreatePostBaseSchema = z.infer<typeof createPostBaseSchema>

export type DisplayPostSchema = z.infer<typeof displayPostSchema>

export const { schemas: postSchemas, $ref } = buildJsonSchemas(
  { postSchema, createPostSchema, displayPostSchema, reactionSchema, createPostBaseSchema },
  { $id: "Posts" }
)
