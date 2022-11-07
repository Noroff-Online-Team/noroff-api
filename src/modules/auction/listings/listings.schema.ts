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
  }, z.date({ required_error: "endsAt is required" }))
})

export const updateListingCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string"
    })
    .trim(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .trim()
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
}

export const updateListingSchema = z
  .object(updateListingCore)
  .refine(
    ({ title, description, media, endsAt }) => !!title || !!description || !!media || !endsAt,
    "You must provide either title, description, media, or endsAt"
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
