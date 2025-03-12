import { z } from "zod"

import { sortAndPaginationSchema } from "@noroff/api-utils"
import {
  mediaProperties,
  mediaPropertiesWithErrors,
  profileCore
} from "../auth/auth.schema"

const petId = {
  id: z.string().uuid()
}

export const petIdSchema = z.object(petId)

export const petCore = {
  ...petId,
  name: z.string(),
  species: z.string(),
  breed: z.string(),
  age: z.number().int().positive(),
  gender: z.string(),
  size: z.string(),
  color: z.string(),
  description: z.string(),
  adoptionStatus: z.string().nullish(),
  location: z.string(),
  image: z.object(mediaProperties),
  created: z.date(),
  updated: z.date(),
  owner: z.object(profileCore)
}

export const displayPetSchema = z.object(petCore)

export const createPetSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string"
  }),
  species: z.string({
    required_error: "Species is required",
    invalid_type_error: "Species must be a string"
  }),
  breed: z.string({
    required_error: "Breed is required",
    invalid_type_error: "Breed must be a string"
  }),
  age: z
    .number({
      required_error: "Age is required",
      invalid_type_error: "Age must be a number"
    })
    .int("Age must be an integer")
    .positive("Age must be a positive number"),
  gender: z.string({
    required_error: "Gender is required",
    invalid_type_error: "Gender must be a string"
  }),
  size: z.string({
    required_error: "Size is required",
    invalid_type_error: "Size must be a string"
  }),
  color: z.string({
    required_error: "Color is required",
    invalid_type_error: "Color must be a string"
  }),
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string"
  }),
  adoptionStatus: z
    .string({
      required_error: "Adoption status is required",
      invalid_type_error: "Adoption status must be a string"
    })
    .optional(),
  location: z.string({
    required_error: "Location is required",
    invalid_type_error: "Location must be a string"
  }),
  image: z.object(mediaProperties)
})

const updatePetCore = {
  name: z
    .string({
      invalid_type_error: "Name must be a string"
    })
    .optional(),
  species: z
    .string({
      invalid_type_error: "Species must be a string"
    })
    .optional(),
  breed: z
    .string({
      invalid_type_error: "Breed must be a string"
    })
    .optional(),
  age: z
    .number({
      invalid_type_error: "Age must be a number"
    })
    .int("Age must be an integer")
    .positive("Age must be a positive number")
    .optional(),
  gender: z
    .string({
      invalid_type_error: "Gender must be a string"
    })
    .optional(),
  size: z
    .string({
      invalid_type_error: "Size must be a string"
    })
    .optional(),
  color: z
    .string({
      invalid_type_error: "Color must be a string"
    })
    .optional(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .optional(),
  adoptionStatus: z
    .string({
      invalid_type_error: "Adoption status must be a string"
    })
    .optional(),
  location: z
    .string({
      invalid_type_error: "Location must be a string"
    })
    .optional(),
  image: z.object(mediaPropertiesWithErrors).optional()
}

export const updatePetSchema = z
  .object(updatePetCore)
  .refine(
    data => Object.keys(data).length > 0,
    "You must provide at least one field to update"
  )

export const petsQuerySchema = sortAndPaginationSchema

export type CreatePetSchema = z.infer<typeof createPetSchema>

export type UpdatePetSchema = z.infer<typeof updatePetSchema>
