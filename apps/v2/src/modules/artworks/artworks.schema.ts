import { z } from "zod"

import { sortAndPaginationSchema } from "@noroff/api-utils"
import {
  mediaProperties,
  mediaPropertiesWithErrors,
  profileCore
} from "../auth/auth.schema"

const artworkId = {
  id: z.string().uuid()
}

export const artworkIdSchema = z.object(artworkId)

export const artworkCore = {
  ...artworkId,
  title: z.string(),
  artist: z.string(),
  year: z.number().int().positive().nullish(),
  medium: z.string(),
  description: z.string(),
  location: z.string().nullish(),
  image: z.object(mediaProperties),
  created: z.date(),
  updated: z.date(),
  owner: z.object(profileCore)
}

export const displayArtworkSchema = z.object(artworkCore)

export const createArtworkSchema = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string"
  }),
  artist: z.string({
    required_error: "Artist is required",
    invalid_type_error: "Artist must be a string"
  }),
  year: z
    .number({
      required_error: "Year is required",
      invalid_type_error: "Year must be a number"
    })
    .int("Year must be an integer")
    .positive("Year must be a positive number")
    .optional(),
  medium: z.string({
    required_error: "Medium is required",
    invalid_type_error: "Medium must be a string"
  }),
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string"
  }),
  location: z
    .string({
      required_error: "Location is required",
      invalid_type_error: "Location must be a string"
    })
    .optional(),
  image: z.object(mediaProperties).optional()
})

const updateArtworkCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string"
    })
    .optional(),
  artist: z
    .string({
      invalid_type_error: "Artist must be a string"
    })
    .optional(),
  year: z
    .number({
      invalid_type_error: "Year must be a number"
    })
    .optional(),
  medium: z
    .string({
      invalid_type_error: "Medium must be a string"
    })
    .optional(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .optional(),
  location: z
    .string({
      invalid_type_error: "Location must be a string"
    })
    .optional(),
  image: z.object(mediaPropertiesWithErrors).optional()
}

export const updateArtworkSchema = z
  .object(updateArtworkCore)
  .refine(
    data => Object.keys(data).length > 0,
    "You must provide at least one field to update"
  )

export const artworksQuerySchema = sortAndPaginationSchema

export type CreateArtworkSchema = z.infer<typeof createArtworkSchema>

export type UpdateArtworkSchema = z.infer<typeof updateArtworkSchema>
