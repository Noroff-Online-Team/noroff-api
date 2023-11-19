import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { profileCore } from "../../auth/auth.schema"
import { venueCore } from "../venues/venues.schema"

const bookingId = {
  id: z.string().uuid()
}

export const bookingIdSchema = z.object(bookingId)

export const bookingCore = {
  ...bookingId,
  dateFrom: z.date(),
  dateTo: z.date(),
  guests: z.number().int(),
  created: z.date(),
  updated: z.date(),
  venue: z.object(venueCore).omit({ bookings: true }).optional(),
  customer: z.object(profileCore).optional()
}

export const displayBookingSchema = z.object(bookingCore)

const queryFlagsCore = {
  _customer: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _venue: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const queryFlagsSchema = z.object(queryFlagsCore)

export const bookingsQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore)

export const createBookingSchema = z.object({
  dateFrom: z.preprocess(
    arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    },
    z.date({ required_error: "dateFrom is required" })
  ),
  dateTo: z.preprocess(
    arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    },
    z.date({ required_error: "dateTo is required" })
  ),
  guests: z
    .number({
      invalid_type_error: "Guests must be a number"
    })
    .int("Guests must be an integer")
    .min(1, "Guests must be at least 1"),
  venueId: z
    .string({
      required_error: "venueId is required",
      invalid_type_error: "venueId must be a string"
    })
    .uuid("venueId must be a valid UUID")
})

const updateBookingCore = {
  dateFrom: z
    .preprocess(arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    }, z.date())
    .refine(
      date => {
        const today = new Date()
        if (date < today) {
          return false
        }
        return true
      },
      {
        message: "dateFrom cannot be in the past"
      }
    )
    .optional(),
  dateTo: z
    .preprocess(arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    }, z.date())
    .refine(
      date => {
        const today = new Date()
        if (date < today) {
          return false
        }
        return true
      },
      {
        message: "dateTo cannot be in the past"
      }
    )
    .optional(),
  guests: z
    .number({
      invalid_type_error: "Guests must be a number"
    })
    .int("Guests must be an integer")
    .min(1, "Guests must be at least 1")
    .optional()
}

export const updateBookingSchema = z
  .object(updateBookingCore)
  .refine(
    ({ dateFrom, dateTo, guests }) => !!dateFrom || !!dateTo || !!guests,
    "You must provide either dateFrom, dateTo, or guests"
  )
  .refine(({ dateFrom, dateTo }) => {
    if (dateFrom && dateTo) {
      if (dateFrom > dateTo) {
        return false
      }
    }
    return true
  }, "dateFrom cannot be after dateTo")

export type CreateBookingSchema = z.infer<typeof createBookingSchema>

export type UpdateBookingSchema = z.infer<typeof updateBookingSchema>
