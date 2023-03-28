import { z } from "zod"

const venueId = {
  id: z.string().uuid()
}

const venueMeta = {
  wifi: z.boolean(),
  parking: z.boolean(),
  breakfast: z.boolean(),
  pets: z.boolean()
}

export const venueCore = {
  ...venueId,
  name: z.string(),
  description: z.string().nullish(),
  media: z.string().array().nullish(),
  price: z.number(),
  maxGuests: z.number().int(),
  created: z.date(),
  updated: z.date(),
  meta: z.object(venueMeta),
  owner: z
    .object({
      name: z.string(),
      email: z.string(),
      media: z.string().url().nullish().or(z.literal(""))
    })
    .optional(),
  bookings: z
    .object({
      id: z.string().uuid(),
      dateFrom: z.date(),
      dateTo: z.date(),
      guests: z.number().int(),
      created: z.date(),
      updated: z.date()
    })
    .array()
    .optional()
}

export const displayVenueSchema = z.object(venueCore)

const queryFlagsCore = {
  _owner: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _bookings: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const queryFlagsSchema = z.object(queryFlagsCore)

export const venuesQuerySchema = z.object({
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
