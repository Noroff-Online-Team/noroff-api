import { z } from "zod"

const tagsAndMedia = {
  tags: z.union([z.string().array(), z.undefined()]),
  media: z.string().url("Must be valid URL").nullish()
}

export const postCore = {
  title: z.string({
    invalid_type_error: "Title must be a string",
    required_error: "Title is required"
  }),
  body: z.string({
    invalid_type_error: "Body must be a string"
  }),
  ...tagsAndMedia
}

const updatePostCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string"
    })
    .nullish(),
  body: z
    .string({
      invalid_type_error: "Body must be a string"
    })
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
  id: z.preprocess(val => parseInt(val as string, 10), z.number().int())
})

const postMeta = {
  created: z.date(),
  updated: z.date()
}

export const reactionSchema = z.object({
  symbol: z.string(),
  count: z.number().int(),
  postId: z.number().int()
})

export const reactionParamsSchema = z.object({
  symbol: z.string().regex(/\p{Extended_Pictographic}/u, "Must be a valid emoji"),
  id: z.preprocess(
    val => parseInt(val as string, 10),
    z
      .number({
        invalid_type_error: "ID must be a number",
        required_error: "ID is required"
      })
      .int()
  )
})

const reactions = {
  reactions: reactionSchema.array().optional()
}

const commentCore = {
  body: z.string({
    invalid_type_error: "Body must be a string",
    required_error: "Body is required"
  }),
  replyToId: z
    .number({
      invalid_type_error: "ReplyToId must be a number"
    })
    .nullish()
}

export const createCommentSchema = z.object(commentCore)

export const displayCommentSchema = z.object({
  ...commentCore,
  id: z.number().int(),
  postId: z.number().int().nullish(),
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

export const createPostBaseSchema = z.object(postCore)

export const updatePostBodySchema = z
  .object(updatePostCore)
  .refine(({ title, body }) => !!title || !!body, "You must provide either title or body")

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
  author: z
    .object({
      name: z.string(),
      email: z.string().email(),
      avatar: z.string().url().nullable(),
      banner: z.string().url().nullable()
    })
    .optional(),
  _count: z
    .object({
      comments: z.number().int().optional(),
      reactions: z.number().int().optional()
    })
    .optional()
})

export const authorQuerySchema = z
  .object({
    _author: z.preprocess(val => Boolean(val), z.boolean())
  })
  .optional()

const queryFlagsCore = {
  _author: z.preprocess(val => Boolean(val), z.boolean()).optional(),
  _reactions: z.preprocess(val => Boolean(val), z.boolean()).optional(),
  _comments: z.preprocess(val => Boolean(val), z.boolean()).optional()
}

export const queryFlagsSchema = z.object(queryFlagsCore)

export const postsQuerySchema = z
  .object({
    sort: z.string().optional(),
    sortOrder: z.string().optional(),
    limit: z.preprocess(val => parseInt(val as string, 10), z.number().int()).optional(),
    offset: z.preprocess(val => parseInt(val as string, 10), z.number().int()).optional(),
    ...queryFlagsCore
  })
  .optional()

export type PostSchema = z.infer<typeof postSchema>

export type CreatePostSchema = z.infer<typeof createPostSchema>

export type CreatePostBaseSchema = z.infer<typeof createPostBaseSchema>

export type DisplayPostSchema = z.infer<typeof displayPostSchema>

export type CreateCommentSchema = z.infer<typeof createCommentSchema>

export type DisplayCommentSchema = z.infer<typeof displayCommentSchema>
