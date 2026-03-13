import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { profileCore } from "../../auth/auth.schema"

const NAME_MAX_LENGTH = 100
const UNIT_MAX_LENGTH = 50
const CATEGORY_MAX_LENGTH = 50

const pantryItemId = {
  id: z
    .string({
      invalid_type_error: "ID must be a string",
      required_error: "ID is required"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
}

export const displayPantryItemSchema = z.object({
  ...pantryItemId,
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  category: z.string(),
  owner: z.object(profileCore),
  created: z.date(),
  updated: z.date()
})

export const createPantryItemSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string"
    })
    .trim()
    .min(1, "Name cannot be empty")
    .max(
      NAME_MAX_LENGTH,
      `Name cannot be greater than ${NAME_MAX_LENGTH} characters`
    ),
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number"
    })
    .min(0, "Quantity cannot be negative"),
  unit: z
    .string({
      required_error: "Unit is required",
      invalid_type_error: "Unit must be a string"
    })
    .trim()
    .max(
      UNIT_MAX_LENGTH,
      `Unit cannot be greater than ${UNIT_MAX_LENGTH} characters`
    ),
  category: z
    .string({
      required_error: "Category is required",
      invalid_type_error: "Category must be a string"
    })
    .trim()
    .max(
      CATEGORY_MAX_LENGTH,
      `Category cannot be greater than ${CATEGORY_MAX_LENGTH} characters`
    )
})

export const updatePantryItemSchema = z
  .object({
    name: z
      .string({ invalid_type_error: "Name must be a string" })
      .trim()
      .min(1, "Name cannot be empty")
      .max(NAME_MAX_LENGTH)
      .optional(),
    quantity: z
      .number({ invalid_type_error: "Quantity must be a number" })
      .min(0, "Quantity cannot be negative")
      .optional(),
    unit: z
      .string({ invalid_type_error: "Unit must be a string" })
      .trim()
      .max(UNIT_MAX_LENGTH)
      .optional(),
    category: z
      .string({ invalid_type_error: "Category must be a string" })
      .trim()
      .max(CATEGORY_MAX_LENGTH)
      .optional()
  })
  .refine(
    data => Object.keys(data).length > 0,
    "You must provide at least one field to update"
  )

export const pantryItemParamsSchema = z.object(pantryItemId)

export const pantryItemsQuerySchema = sortAndPaginationSchema

export type CreatePantryItemSchema = z.infer<typeof createPantryItemSchema>
export type UpdatePantryItemSchema = z.infer<typeof updatePantryItemSchema>
