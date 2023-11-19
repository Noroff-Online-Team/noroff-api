import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { profileCore, profileMedia } from "../../auth/auth.schema"
import { postSchema } from "../posts/posts.schema"

export const updateProfileSchema = z.object(profileMedia)
export const profileSchema = z.object(profileCore)

export const profileNameSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string"
    })
    .trim()
})

const profileFollows = {
  followers: z.object(profileCore).array().optional(),
  following: z.object(profileCore).array().optional()
}

export const followUnfollowProfileSchema = z.object(profileFollows)

export const displayProfileSchema = z.object({
  ...profileCore,
  ...profileFollows,
  posts: postSchema.array().optional(),
  _count: z
    .object({
      posts: z.number().int().optional(),
      followers: z.number().int().optional(),
      following: z.number().int().optional()
    })
    .nullish()
})

const queryFlagsCore = {
  _followers: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _following: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _posts: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const queryFlagsSchema = z.object(queryFlagsCore)

export const profilesQuerySchema = sortAndPaginationSchema
  .extend({
    _tag: z.string({ invalid_type_error: "Tag must be a string" }).optional()
  })
  .extend(queryFlagsCore)

export const searchQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore).extend({
  q: z
    .string({ required_error: "Query is required", invalid_type_error: "Query must be a string" })
    .nonempty("Query cannot be empty")
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
