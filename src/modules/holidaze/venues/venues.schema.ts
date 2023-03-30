import { z } from "zod"

const venueId = {
  id: z.string().uuid()
}

export const venueIdSchema = z.object(venueId)

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
      avatar: z.string().url().nullish().or(z.literal(""))
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

export const createVenueSchema = z.object({
  name: z.string({
    invalid_type_error: "Name must be a string",
    required_error: "Name is required"
  }),
  description: z.string({
    invalid_type_error: "Description must be a string",
    required_error: "Description is required"
  }),
  media: z
    .string({
      invalid_type_error: "Media must be a string"
    })
    .url("Media must be a valid URL")
    .array()
    .max(8, "You cannot have more than 8 images")
    .or(z.literal(""))
    .optional(),
  price: z.number({
    invalid_type_error: "Price must be a number",
    required_error: "Price is required"
  }),
  maxGuests: z
    .number({
      invalid_type_error: "Max guests must be a number",
      required_error: "Max guests is required"
    })
    .int("Max guests must be an integer"),
  meta: z
    .object({
      wifi: z
        .boolean({
          invalid_type_error: "Wifi must be a boolean"
        })
        .optional(),
      parking: z
        .boolean({
          invalid_type_error: "Parking must be a boolean"
        })
        .optional(),
      breakfast: z
        .boolean({
          invalid_type_error: "Breakfast must be a boolean"
        })
        .optional(),
      pets: z
        .boolean({
          invalid_type_error: "Pets must be a boolean"
        })
        .optional()
    })
    .optional()
})

export type CreateVenueSchema = z.infer<typeof createVenueSchema>
