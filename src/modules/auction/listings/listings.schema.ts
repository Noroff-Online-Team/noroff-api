import { z } from "zod"
import { displayProfileSchema } from "../profiles/profiles.schema"

const listingId = {
  id: z.string().uuid()
}

const bidCore = {
  id: z.string().uuid(),
  amount: z.number(),
  bidderName: z.string(),
  created: z.date()
}

export const listingCore = {
  ...listingId,
  title: z.string(),
  description: z.string().nullish(),
  media: z.string().array().nullish(),
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

const tagsAndMedia = {
  tags: z.union([
    z
      .string({
        invalid_type_error: "Tags must be an array of strings"
      })
      .array(),
    z.undefined()
  ]),
  media: z
    .string({
      invalid_type_error: "Image must be a string"
    })
    .url("Image must be valid URL")
    .array()
    .nullish()
    .or(z.literal(""))
}

export const createListingSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string"
    })
    .trim(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .trim()
    .nullish(),
  endsAt: z
    .preprocess(arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    }, z.date({ required_error: "endsAt is required" }))
    .refine(
      date => {
        const today = new Date()
        const oneYearFromToday = new Date(today.setFullYear(today.getFullYear() + 1))
        if (date > oneYearFromToday) {
          return false
        }
        return true
      },
      {
        message: "endsAt cannot be more than one year from now"
      }
    ),
  ...tagsAndMedia
})

export const updateListingCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string"
    })
    .trim()
    .nullish(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
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

export const listingIdParamsSchema = z.object(listingId)

export const listingQuerySchema = z.object({
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
  _tags: z
    .string({
      invalid_type_error: "Tag must be a string"
    })
    .optional(),
  ...queryFlagsCore
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

export type ListingResponseSchema = z.infer<typeof listingResponseSchema>

export type CreateListingSchema = z.infer<typeof createListingSchema>

export type UpdateListingSchema = z.infer<typeof updateListingSchema>
