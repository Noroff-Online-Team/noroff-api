import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { mediaProperties, mediaPropertiesWithErrors, profileCore } from "../../auth/auth.schema"
import { displayProfileSchema } from "../profiles/profiles.schema"

const bidCore = {
  id: z.string().uuid(),
  amount: z.number(),
  bidder: z.object(profileCore),
  created: z.date()
}

const mediaCore = {
  media: z.object(mediaPropertiesWithErrors).array().max(8, "You cannot have more than 8 images").nullish()
}

export const mediaSchema = z.object(mediaCore)

export const listingCore = {
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  media: z.object(mediaProperties).array().nullish(),
  tags: z.string().array().nullish(),
  created: z.date(),
  updated: z.date(),
  endsAt: z.date(),
  bids: z.object(bidCore).array().optional(),
  seller: displayProfileSchema.omit({ credits: true, listings: true, _count: true }).optional(),
  _count: z
    .object({
      bids: z.number().int().optional()
    })
    .optional()
}

export const listingResponseSchema = z.object(listingCore)

export const profileBidsResponseSchema = z.object({
  ...bidCore,
  listing: listingResponseSchema.omit({ bids: true, seller: true, _count: true }).optional()
})

const tagsAndMedia = {
  tags: z
    .string({
      invalid_type_error: "Tags must be an array of strings"
    })
    .max(24, "Tags cannot be greater than 24 characters")
    .array()
    .max(8, "You cannot have more than 8 tags")
    .optional(),
  media: z.object(mediaPropertiesWithErrors).array().max(8, "You cannot have more than 8 images").nullish()
}

export const createListingSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string"
    })
    .max(280, "Title cannot be greater than 280 characters")
    .trim(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .max(280, "Description cannot be greater than 280 characters")
    .trim()
    .nullish(),
  endsAt: z
    .preprocess(
      arg => {
        if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
      },
      z.date({ required_error: "endsAt is required" })
    )
    .refine(
      date => {
        const today = new Date()
        const oneYearFromToday = new Date(today.setFullYear(today.getFullYear() + 1))
        const now = new Date()
        if (date > oneYearFromToday || date < now) {
          return false
        }
        return true
      },
      {
        message: "endsAt cannot be past date or more than one year from now"
      }
    ),
  ...tagsAndMedia
})

export const updateListingCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string"
    })
    .max(280, "Title cannot be greater than 280 characters")
    .trim()
    .nullish(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .max(280, "Description cannot be greater than 280 characters")
    .trim()
    .nullish(),
  ...tagsAndMedia
}

export const updateListingSchema = z
  .object(updateListingCore)
  .refine(
    ({ title, description, media, tags }) => !!title || !!description || !!media || !!tags,
    "You must provide either title, description, media, or tags"
  )

const queryFlagsCore = {
  _seller: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _bids: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const queryFlagsSchema = z.object(queryFlagsCore)

export const listingIdParamsSchema = z.object({
  id: z
    .string({
      required_error: "ID is required",
      invalid_type_error: "ID must be a string"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
})

export const listingQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore).extend({
  _tag: z.string({ invalid_type_error: "Tag must be a string" }).optional(),
  _active: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
})

export const bidBodySchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number"
    })
    .int()
    .positive("Amount must be a positive number")
})

export const searchQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore).extend({
  q: z
    .string({ required_error: "Query is required", invalid_type_error: "Query must be a string" })
    .nonempty("Query cannot be empty")
})

export const listingWinsQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore)

export type CreateListingSchema = z.infer<typeof createListingSchema>

export type UpdateListingSchema = z.infer<typeof updateListingSchema>
