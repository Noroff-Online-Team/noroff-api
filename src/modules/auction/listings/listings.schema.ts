import { z } from "zod"
import { displayProfileSchema } from "../profiles/profiles.schema"
// import { bidsSchema } from "../bids/bids.schema"

export const listing = {
  id: z.number(),
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string"
  }),
  description: z.string({
    invalid_type_error: "Description must be a string"
  }),
  image: z
    .string({
      invalid_type_error: "Image must be a string"
    })
    .url("Image must be valid URL")
    .nullish()
    .or(z.literal("")),
  created: z.date(),
  startsAt: z.date(),
  endsAt: z.date(),
  bids: z.object({}).array().optional(),
  seller: displayProfileSchema.omit({ credits: true }).optional(),
  _count: z
    .object({
      bids: z.number().int().optional()
    })
    .optional()
}

export const listingResponseSchema = z.object(listing)

const queryFlagsCore = {
  _seller: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _bids: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const queryFlagsSchema = z.object(queryFlagsCore)

export const listingIdParamsSchema = z.object({
  id: z.preprocess(
    val => parseInt(val as string, 10),
    z
      .number({
        invalid_type_error: "Listing ID must be a number"
      })
      .int()
  )
})

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
