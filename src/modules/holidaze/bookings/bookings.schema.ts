import { z } from "zod"
import { venueCore } from "../venues/venues.schema"

const bookingId = {
  id: z.string().uuid()
}

export const bookingCore = {
  ...bookingId,
  dateFrom: z.date(),
  dateTo: z.date(),
  guests: z.number().int(),
  created: z.date(),
  updated: z.date(),
  venue: z.object(venueCore).omit({ bookings: true }).optional(),
  customer: z
    .object({
      name: z.string(),
      email: z.string(),
      avatar: z.string().url().nullish().or(z.literal(""))
    })
    .optional()
}

export const displayBookingSchema = z.object(bookingCore)

const queryFlagsCore = {
  _customer: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _venue: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const queryFlagsSchema = z.object(queryFlagsCore)

export const bookingsQuerySchema = z.object({
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
