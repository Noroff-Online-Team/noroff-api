import { z } from "zod"
import { bookingCore } from "../bookings/bookings.schema"
import { venueCore } from "../venues/venues.schema"

const profileMedia = {
  avatar: z
    .string({
      invalid_type_error: "Avatar must be a string"
    })
    .url("Avatar must be valid URL")
    .nullish()
    .or(z.literal(""))
}

export const profileMediaSchema = z.object(profileMedia)

export const profileCore = {
  name: z
    .string()
    .regex(/^[\w]+$/, "Name can only use a-Z, 0-9, and _")
    .max(20, "Name cannot be greater than 20 characters")
    .trim(),
  email: z
    .string({
      invalid_type_error: "Email must be a string"
    })
    .email()
    .regex(/^[\w\-.]+@(stud\.)?noroff\.no$/, "Only noroff.no emails are allowed to register")
    .trim(),
  ...profileMedia
}

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
  ...profileCore
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

export const queryFlagsSchema = z.object(queryFlagsCore)

export const profilesQuerySchema = z.object({
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

export type ProfileSchema = z.infer<typeof profileSchema>

export type DisplayProfileSchema = z.infer<typeof displayProfileSchema>

export type CreateProfileInput = z.infer<typeof createProfileSchema>

export type ProfileMediaSchema = z.infer<typeof profileMediaSchema>
