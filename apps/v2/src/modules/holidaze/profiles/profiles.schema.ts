import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { profileCore, profileMedia } from "../../auth/auth.schema"
import { bookingCore } from "../bookings/bookings.schema"
import { venueCore } from "../venues/venues.schema"

const profileVenueManager = {
  venueManager: z
    .boolean({
      invalid_type_error: "Venue manager must be a boolean"
    })
    .optional()
}

export const updateProfileSchema = z.object({
  ...profileMedia,
  ...profileVenueManager
})

export const holidazeProfileSchema = z.object(profileCore).extend(profileVenueManager)

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
  ...profileVenueManager
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
  ...profileVenueManager,
  venues: z.object(venueCore).omit({ bookings: true }).array().optional(),
  bookings: z.object(bookingCore).array().optional(),
  _count: z
    .object({
      venues: z.number().int().optional(),
      bookings: z.number().int().optional()
    })
    .nullish()
})

const queryFlagsCore = {
  _bookings: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional(),
  _venues: z.preprocess(val => String(val).toLowerCase() === "true", z.boolean()).optional()
}

export const searchQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore).extend({
  q: z
    .string({ required_error: "Query is required", invalid_type_error: "Query must be a string" })
    .nonempty("Query cannot be empty")
})

export const queryFlagsSchema = z.object(queryFlagsCore)

export const profilesQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore)

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
