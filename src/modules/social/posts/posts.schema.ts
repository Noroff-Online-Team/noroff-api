import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

export const postCore = {
  title: z.string(),
  body: z.string(),
  tags: z.string().array().optional(),
  media: z.string().optional()
}

const postOwner = {
  owner: z.string()
}

const postId = {
  id: z.number().int()
}

const postMeta = {
  created: z.date(),
  updated: z.date()
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

const commentCore = {
  body: z.string(),
  replyToId: z.number().optional(),
}

const replySchema = z.object({
  ...commentCore,
  owner: z.string(),
  created: z.date()
})

const replies = {
  replies: replySchema.array().optional()
}

const createCommentSchema = z.object({
  ...commentCore,
})

const displayCommentSchema = z.object({
  ...commentCore,
  ...replies,
  id: z.number().int(),
  postId: z.number().int(),
  owner: z.string(),
  created: z.date()
})

const comments = {
  comments: displayCommentSchema.array().optional()
}

export const postSchema = z.object({
  ...postId,
  ...postOwner,
  ...postMeta,
  ...postCore
})

export const createPostBaseSchema = z.object({
  ...postCore
})

export const createPostSchema = z.object({
  ...postOwner,
  ...postCore
})

export const displayPostSchema = z.object({
  ...postCore,
  ...reactions,
  ...comments,
  ...postMeta,
  ...postId,
  author: z.object({
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().optional()
  }).optional(),
  _count: z.object({
    comments: z.number().int().optional(),
    reactions: z.number().int().optional()
  }).optional()
})

export type PostSchema = z.infer<typeof postSchema>

export type CreatePostSchema = z.infer<typeof createPostSchema>

export type CreatePostBaseSchema = z.infer<typeof createPostBaseSchema>

export type DisplayPostSchema = z.infer<typeof displayPostSchema>

export type CreateCommentSchema = z.infer<typeof createCommentSchema>

export type DisplayCommentSchema = z.infer<typeof displayCommentSchema>

export const { schemas: postSchemas, $ref } = buildJsonSchemas(
  {
    postSchema,
    createPostSchema,
    displayPostSchema,
    reactionSchema,
    createPostBaseSchema,
    createCommentSchema,
    displayCommentSchema
  },
  { $id: "Posts" }
)
