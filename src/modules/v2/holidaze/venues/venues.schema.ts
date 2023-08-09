import { z } from "zod"
import { sortAndPaginationSchema } from "@/utils/sortAndPaginationSchema"
import { profileCore } from "../../auth/auth.schema"

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

const venueLocation = {
  address: z.string(),
  city: z.string(),
  zip: z.string(),
  country: z.string(),
  continent: z.string(),
  lat: z.number(),
  lng: z.number()
}

export const venueCore = {
  ...venueId,
  name: z.string(),
  description: z.string().nullish(),
  media: z.string().array().nullish(),
  price: z.number(),
  maxGuests: z.number().int(),
  rating: z.number().nullish(),
  created: z.date(),
  updated: z.date(),
  meta: z.object(venueMeta),
  location: z.object(venueLocation),
  owner: z.object(profileCore).optional(),
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

export const venuesQuerySchema = sortAndPaginationSchema.extend(queryFlagsCore)

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
  price: z
    .number({
      invalid_type_error: "Price must be a number",
      required_error: "Price is required"
    })
    .min(0, "You cannot pay guests to stay at your venue"),
  maxGuests: z
    .number({
      invalid_type_error: "Max guests must be a number",
      required_error: "Max guests is required"
    })
    .int("Max guests must be an integer")
    .min(1, "A venue must accommodate at least one guest")
    .max(100, "A venue cannot accommodate more than 100 guests"),
  rating: z
    .number({
      invalid_type_error: "Rating must be a number"
    })
    .min(0, "Rating cannot be less than 0")
    .max(5, "Rating cannot be greater than 5")
    .optional(),
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
    .optional(),
  location: z
    .object({
      address: z
        .string({
          invalid_type_error: "Address must be a string"
        })
        .optional(),
      city: z
        .string({
          invalid_type_error: "City must be a string"
        })
        .optional(),
      zip: z
        .string({
          invalid_type_error: "Zip must be a string"
        })
        .optional(),
      country: z
        .string({
          invalid_type_error: "Country must be a string"
        })
        .optional(),
      continent: z
        .string({
          invalid_type_error: "Continent must be a string"
        })
        .optional(),
      lat: z
        .number({
          invalid_type_error: "Latitude must be a number"
        })
        .optional(),
      lng: z
        .number({
          invalid_type_error: "Longitude must be a number"
        })
        .optional()
    })
    .optional()
})

const updateVenueCore = {
  name: z
    .string({
      invalid_type_error: "Name must be a string"
    })
    .optional(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .optional(),
  media: z
    .string({
      invalid_type_error: "Media must be a string"
    })
    .url("Media must be a valid URL")
    .array()
    .max(8, "You cannot have more than 8 images")
    .or(z.literal(""))
    .optional(),
  price: z
    .number({
      invalid_type_error: "Price must be a number"
    })
    .min(0, "You cannot pay guests to stay at your venue")
    .optional(),
  maxGuests: z
    .number({
      invalid_type_error: "Max guests must be a number"
    })
    .int("Max guests must be an integer")
    .min(1, "A venue must accommodate at least one guest")
    .max(100, "A venue cannot accommodate more than 100 guests")
    .optional(),
  rating: z
    .number({
      invalid_type_error: "Rating must be a number"
    })
    .min(0, "Rating cannot be less than 0")
    .max(5, "Rating cannot be greater than 5")
    .optional(),
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
    .optional(),
  location: z
    .object({
      address: z
        .string({
          invalid_type_error: "Address must be a string"
        })
        .optional(),
      city: z
        .string({
          invalid_type_error: "City must be a string"
        })
        .optional(),
      zip: z
        .string({
          invalid_type_error: "Zip must be a string"
        })
        .optional(),
      country: z
        .string({
          invalid_type_error: "Country must be a string"
        })
        .optional(),
      continent: z
        .string({
          invalid_type_error: "Continent must be a string"
        })
        .optional(),
      lat: z
        .number({
          invalid_type_error: "Latitude must be a number"
        })
        .optional(),
      lng: z
        .number({
          invalid_type_error: "Longitude must be a number"
        })
        .optional()
    })
    .optional()
}

export const updateVenueSchema = z
  .object(updateVenueCore)
  .refine(data => Object.keys(data).length > 0, "You must provide at least one field to update")

export type CreateVenueSchema = z.infer<typeof createVenueSchema>

export type UpdateVenueSchema = z.infer<typeof updateVenueSchema>
