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

export const profileBidsResponseSchema = z.object({
  ...bidCore,
  listing: listingResponseSchema.omit({ bids: true, seller: true, _count: true }).optional()
})

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
    .array()
    .max(8, "You cannot have more than 8 images")
    .nullish()
    .or(z.literal(""))
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
    .preprocess(arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    }, z.date({ required_error: "endsAt is required" }))
    .refine(
      date => {
        const today = new Date()
        const oneYearFromToday = new Date(today.setFullYear(today.getFullYear() + 1))
        if (date > oneYearFromToday || date < today) {
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
  _tag: z
    .string({
      invalid_type_error: "Tag must be a string"
    })
    .optional(),
  _active: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
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
