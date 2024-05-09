import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { mediaPropertiesWithErrors, profileCore } from "../../auth/auth.schema"

const POST_TITLE_MIN_LENGTH = 1
const POST_TITLE_MAX_LENGTH = 280
const POST_BODY_MAX_LENGTH = 10_000
const POST_TAGS_MAX_LENGTH = 24
const POST_MAX_TAGS = 8

const mediaCore = {
  media: z.object(mediaPropertiesWithErrors).nullish()
}

const nameSchema = {
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string"
    })
    .trim()
}

export const mediaSchema = z.object(mediaCore)

export const profileNameSchema = z.object(nameSchema)

const tagsAndMedia = {
  tags: z
    .string({
      invalid_type_error: "Tags must be an array of strings"
    })
    .max(POST_TAGS_MAX_LENGTH, "Tags cannot be greater than 24 characters")
    .array()
    .max(POST_MAX_TAGS, "You cannot have more than 8 tags")
    .optional(),
  ...mediaCore
}

export const postCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string",
      required_error: "Title is required"
    })
    .min(POST_TITLE_MIN_LENGTH, "Title cannot be empty")
    .max(POST_TITLE_MAX_LENGTH, "Title cannot be greater than 280 characters")
    .trim(),
  body: z
    .string({
      invalid_type_error: "Body must be a string"
    })
    .max(POST_BODY_MAX_LENGTH, `Body cannot be greater than ${POST_BODY_MAX_LENGTH} characters`)
    .trim()
    .nullish(),
  ...tagsAndMedia
}

const updatePostCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string"
    })
    .min(POST_TITLE_MIN_LENGTH, "Title cannot be empty")
    .max(POST_TITLE_MAX_LENGTH, "Title cannot be greater than 280 characters")
    .trim()
    .nullish(),
  body: z
    .string({
      invalid_type_error: "Body must be a string"
    })
    .max(POST_BODY_MAX_LENGTH, `Body cannot be greater than ${POST_BODY_MAX_LENGTH} characters`)
    .trim()
    .nullish(),
  ...tagsAndMedia
}

const postOwner = {
  owner: z.string()
}

const postId = {
  id: z.string().uuid()
}

export const postIdWithNameParamsSchema = z
  .object({
    id: z
      .string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string"
      })
      .uuid("ID must be a valid UUID")
  })
  .extend(nameSchema)

const postMeta = {
  created: z.date(),
  updated: z.date()
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
  .refine(data => Object.keys(data).length > 0, "You must provide at least one field to update")

export const createPostSchema = z.object({
  ...postOwner,
  ...postCore
})

export const displayPostSchema = z.object({
  ...postId,
  ...postCore,
  ...postMeta,
  author: z.object(profileCore).optional()
})

export const postsQuerySchema = sortAndPaginationSchema.extend({
  _tag: z.string({ invalid_type_error: "Tag must be a string" }).optional()
})

export const emojiSchema = z.string().emoji("Must be a valid emoji")

export type CreatePostSchema = z.infer<typeof createPostSchema>

export type CreatePostBaseSchema = z.infer<typeof createPostBaseSchema>

export type DisplayBlogPost = z.infer<typeof displayPostSchema>

export type Media = z.infer<typeof mediaSchema>
