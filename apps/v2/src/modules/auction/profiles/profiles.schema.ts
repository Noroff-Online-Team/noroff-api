import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { mediaProperties, profileCore, profileMedia } from "../../auth/auth.schema"

export const updateProfileSchema = z.object(profileMedia)

const profileCredits = {
  credits: z
    .number({
      invalid_type_error: "Credits must be a number"
    })
    .int()
}

export const profileCreditsSchema = z.object(profileCredits)

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
  ...profileCore,
  ...profileCredits
})

export const profileSchema = z.object(profileCore)

export const profileNameSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string"
    })
    .trim()
})

export const displayProfileSchema = z.object({
  ...profileCore,
  ...profileCredits,
  listings: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string().nullish(),
      media: z.object(mediaProperties).array().nullish(),
      tags: z.string().array().nullish(),
      created: z.date(),
      updated: z.date(),
      endsAt: z.date()
    })
    .array()
    .optional(),
  wins: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string().nullish(),
      media: z.object(mediaProperties).array().nullish(),
      tags: z.string().array().nullish(),
      created: z.date(),
      updated: z.date(),
      endsAt: z.date()
    })
    .array()
    .optional(),
  _count: z
    .object({
      listings: z.number().int().optional(),
      wins: z.number().int().optional()
    })
    .nullish()
})

const queryFlagsCore = {
  _listings: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _wins: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const searchQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore).extend({
  q: z
    .string({ required_error: "Query is required", invalid_type_error: "Query must be a string" })
    .nonempty("Query cannot be empty")
})

export const queryFlagsSchema = z.object(queryFlagsCore)

export const profilesQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore)

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
