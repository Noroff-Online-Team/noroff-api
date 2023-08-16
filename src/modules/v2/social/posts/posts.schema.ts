import { z } from "zod"
import { sortAndPaginationSchema } from "@/utils/sortAndPaginationSchema"
import { profileCore } from "../../auth/auth.schema"

const tagsAndMedia = {
  tags: z.union([
    z
      .string({
        invalid_type_error: "Tags must be an array of strings"
      })
      .max(24, "Tags cannot be greater than 24 characters")
      .array()
      .max(8, "You cannot have more than 8 tags"),
    z.undefined()
  ]),
  media: z
    .string({
      invalid_type_error: "Image must be a string"
    })
    .url("Image must be valid URL")
    .nullish()
    .or(z.literal(""))
}

export const postCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string",
      required_error: "Title is required"
    })
    .max(280, "Title cannot be greater than 280 characters")
    .trim(),
  body: z
    .string({
      invalid_type_error: "Body must be a string"
    })
    .max(280, "Body cannot be greater than 280 characters")
    .trim()
    .nullish(),
  ...tagsAndMedia
}

const updatePostCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string"
    })
    .max(280, "Title cannot be greater than 280 characters")
    .trim()
    .nullish(),
  body: z
    .string({
      invalid_type_error: "Body must be a string"
    })
    .max(280, "Body cannot be greater than 280 characters")
    .trim()
    .nullish(),
  ...tagsAndMedia
}

const postOwner = {
  owner: z.string()
}

const postId = {
  id: z.number().int()
}

export const postIdParamsSchema = z.object({
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

const postMeta = {
  created: z.date(),
  updated: z.date()
}

const reactions = {
  reactions: z
    .object({
      symbol: z.string(),
      count: z.number().int()
    })
    .array()
    .optional()
}

export const reactionSchema = z.object({
  postId: z.number().int(),
  symbol: z.string(),
  ...reactions
})

export const reactionParamsSchema = z.object({
  symbol: z
    .string()
    .regex(/\p{Extended_Pictographic}/u, "Must be a valid emoji")
    .trim(),
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

const commentCore = {
  body: z
    .string({
      invalid_type_error: "Body must be a string",
      required_error: "Body is required"
    })
    .max(280, "Body cannot be greater than 280 characters")
    .trim(),
  replyToId: z
    .number({
      invalid_type_error: "ReplyToId must be a number"
    })
    .int()
    .nullish()
}

export const createCommentSchema = z.object(commentCore)

export const displayCommentSchema = z.object({
  ...commentCore,
  id: z.number().int(),
  postId: z.number().int().nullish(),
  owner: z.string(),
  created: z.date(),
  author: z.object(profileCore).optional()
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

export const createPostBaseSchema = z.object(postCore)

export const updatePostBodySchema = z
  .object(updatePostCore)
  .refine(
    ({ title, body, tags, media }) => !!title || !!body || !!tags || !!media,
    "You must provide either title, body, tags, or media"
  )

export const createPostSchema = z.object({
  ...postOwner,
  ...postCore
})

export const displayPostSchema = z.object({
  ...postId,
  ...postCore,
  ...comments,
  ...postMeta,
  ...reactions,
  author: z.object(profileCore).optional(),
  _count: z
    .object({
      comments: z.number().int().optional(),
      reactions: z.number().int().optional()
    })
    .optional()
})

export const authorQuerySchema = z.object({
  _author: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
})

const queryFlagsCore = {
  _author: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _reactions: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _comments: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const queryFlagsSchema = z.object(queryFlagsCore)

export const postsQuerySchema = sortAndPaginationSchema
  .extend({
    _tag: z.string({ invalid_type_error: "Tag must be a string" }).optional()
  })
  .extend(queryFlagsCore)

export const emojiSchema = z.string().emoji("Must be a valid emoji")

export type CreatePostSchema = z.infer<typeof createPostSchema>

export type CreatePostBaseSchema = z.infer<typeof createPostBaseSchema>

export type CreateCommentSchema = z.infer<typeof createCommentSchema>

export type DisplaySocialPost = z.infer<typeof displayPostSchema>
