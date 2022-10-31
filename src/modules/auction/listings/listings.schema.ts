import { z } from "zod"
import { displayProfileSchema } from "../profiles/profiles.schema"

const listingId = {
  id: z.string().uuid()
}

const bidCore = {
  id: z.number(),
  amount: z.number(),
  created: z.date()
}

export const listingCore = {
  ...listingId,
  title: z.string(),
  description: z.string().nullish(),
  media: z.string().array().nullish(),
  created: z.date(),
  updated: z.date(),
  endsAt: z.date(),
  bids: z.object(bidCore).array().optional(),
  seller: displayProfileSchema.omit({ credits: true }).optional(),
  _count: z
    .object({
      bids: z.number().int().optional()
    })
    .optional()
}

export const listingResponseSchema = z.object(listingCore)

export const createListingSchema = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string"
  }),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .nullish(),
  media: z
    .string({
      invalid_type_error: "Image must be a string"
    })
    .url("Image must be valid URL")
    .array()
    .nullish()
    .or(z.literal("")),
  endsAt: z.preprocess(arg => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
  }, z.date())
})

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
  ...queryFlagsCore
})

export type ListingResponseSchema = z.infer<typeof listingResponseSchema>

export type CreateListingSchema = z.infer<typeof createListingSchema>
