import { z } from "zod"
import { postSchema } from "../posts/posts.schema"

const profileMedia = {
  banner: z
    .string({
      invalid_type_error: "Banner must be a string"
    })
    .url("Banner must be valid URL")
    .nullish()
    .or(z.literal("")),
  avatar: z
    .string({
      invalid_type_error: "Avatar must be a string"
    })
    .url("Avatar must be valid URL")
    .nullish()
    .or(z.literal(""))
}

export const profileMediaSchema = z.object(profileMedia)

export const profileCore = {
  name: z
    .string()
    .regex(/^[\w]+$/, "Name can only use a-Z, 0-9, and _")
    .max(20, "Name cannot be greater than 20 characters")
    .trim(),
  email: z
    .string({
      invalid_type_error: "Email must be a string"
    })
    .email()
    .regex(/^[\w\-.]+@(stud.)?noroff.no$/, "Only noroff.no emails are allowed to register")
    .trim(),
  ...profileMedia
}

export const createProfileSchema = z.object({
  ...profileCore,
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string"
    })
    .min(8, "Password must be at least 8 characters")
})

export const createProfileResponseSchema = z.object({
  id: z.number(),
  ...profileCore
})

export const profileSchema = z.object(profileCore)

const followSchema = z.object({
  name: z.string(),
  avatar: z.string().url().nullable()
})

export const profileNameSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string"
  }).trim()
})

const profileFollows = {
  followers: followSchema.array().optional(),
  following: followSchema.array().optional()
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

export const profilesQuerySchema = z.object({
  sort: z
    .string({
      invalid_type_error: "Sort must be a string"
    })
    .optional(),
  sortOrder: z
    .string({
      invalid_type_error: "Sort order must be a string"
    })
    .optional(),
  limit: z
    .preprocess(
      val => parseInt(val as string, 10),
      z
        .number({
          invalid_type_error: "Limit must be a number"
        })
        .int()
        .max(100, "Limit cannot be greater than 100")
    )
    .optional(),
  offset: z
    .preprocess(
      val => parseInt(val as string, 10),
      z
        .number({
          invalid_type_error: "Offset must be a number"
        })
        .int()
    )
    .optional(),
  ...queryFlagsCore
})

export type ProfileSchema = z.infer<typeof profileSchema>

export type DisplayProfileSchema = z.infer<typeof displayProfileSchema>

export type CreateProfileInput = z.infer<typeof createProfileSchema>

export type ProfileMediaSchema = z.infer<typeof profileMediaSchema>

export type FollowSchema = z.infer<typeof followSchema>
