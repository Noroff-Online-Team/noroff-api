import { z } from "zod"
import { sortAndPaginationSchema } from "@/utils/sortAndPaginationSchema"
import { profileCore, profileMedia } from "../../auth/auth.schema"
import { postSchema } from "../posts/posts.schema"

export const profileMediaSchema = z.object(profileMedia)
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
  followers: z
    .object({
      name: z.string(),
      avatar: z.string().url().nullable().or(z.literal(""))
    })
    .array()
    .optional(),
  following: z
    .object({
      name: z.string(),
      avatar: z.string().url().nullable().or(z.literal(""))
    })
    .array()
    .optional()
}

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

export const profilesQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore)

export type ProfileMediaSchema = z.infer<typeof profileMediaSchema>
