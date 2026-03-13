import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import {
  mediaProperties,
  mediaPropertiesWithErrors,
  profileCore
} from "../../auth/auth.schema"

const TITLE_MIN_LENGTH = 1
const TITLE_MAX_LENGTH = 280
const DESCRIPTION_MAX_LENGTH = 2000
const TAGS_MAX_LENGTH = 24
const MAX_TAGS = 8
const CATEGORY_MAX_LENGTH = 50
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const

const createdAndUpdated = {
  created: z.date(),
  updated: z.date()
}

const recipeId = {
  id: z
    .string({
      invalid_type_error: "ID must be a string",
      required_error: "ID is required"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
}

const recipeCore = {
  ...recipeId,
  title: z.string(),
  description: z.string(),
  prepTime: z.number(),
  cookTime: z.number(),
  servings: z.number(),
  difficulty: z.string(),
  category: z.string(),
  ingredients: z.any(),
  instructions: z.any(),
  tags: z.string().array(),
  image: z.object(mediaProperties).nullish(),
  owner: z.object(profileCore),
  ...createdAndUpdated
}

export const displayRecipeSchema = z.object({
  ...recipeCore,
  comments: z
    .object({
      id: z.string(),
      text: z.string(),
      author: z.object(profileCore),
      created: z.date(),
      updated: z.date()
    })
    .array()
    .optional(),
  _count: z
    .object({
      favorites: z.number()
    })
    .optional()
})

export const displayRecipeCommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  recipeId: z.string(),
  author: z.object(profileCore),
  created: z.date(),
  updated: z.date()
})

export const createRecipeSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string"
    })
    .trim()
    .min(TITLE_MIN_LENGTH, "Title cannot be empty")
    .max(
      TITLE_MAX_LENGTH,
      `Title cannot be greater than ${TITLE_MAX_LENGTH} characters`
    ),
  description: z
    .string({
      required_error: "Description is required",
      invalid_type_error: "Description must be a string"
    })
    .trim()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Description cannot be greater than ${DESCRIPTION_MAX_LENGTH} characters`
    ),
  prepTime: z
    .number({
      required_error: "Prep time is required",
      invalid_type_error: "Prep time must be a number"
    })
    .int("Prep time must be an integer")
    .min(0, "Prep time cannot be negative"),
  cookTime: z
    .number({
      required_error: "Cook time is required",
      invalid_type_error: "Cook time must be a number"
    })
    .int("Cook time must be an integer")
    .min(0, "Cook time cannot be negative"),
  servings: z
    .number({
      required_error: "Servings is required",
      invalid_type_error: "Servings must be a number"
    })
    .int("Servings must be an integer")
    .min(1, "Servings must be at least 1"),
  difficulty: z.enum(DIFFICULTY_OPTIONS, {
    message: "Difficulty must be one of: Easy, Medium, Hard"
  }),
  category: z
    .string({
      required_error: "Category is required",
      invalid_type_error: "Category must be a string"
    })
    .trim()
    .max(
      CATEGORY_MAX_LENGTH,
      `Category cannot be greater than ${CATEGORY_MAX_LENGTH} characters`
    ),
  ingredients: z
    .array(
      z.object({
        name: z.string({
          required_error: "Ingredient name is required",
          invalid_type_error: "Ingredient name must be a string"
        }),
        quantity: z.number({
          required_error: "Ingredient quantity is required",
          invalid_type_error: "Ingredient quantity must be a number"
        }),
        unit: z.string({
          required_error: "Ingredient unit is required",
          invalid_type_error: "Ingredient unit must be a string"
        })
      }),
      {
        required_error: "Ingredients are required",
        invalid_type_error: "Ingredients must be an array"
      }
    )
    .min(1, "At least one ingredient is required"),
  instructions: z
    .array(z.string(), {
      required_error: "Instructions are required",
      invalid_type_error: "Instructions must be an array"
    })
    .min(1, "At least one instruction is required"),
  tags: z
    .string({
      invalid_type_error: "Tags must be a string"
    })
    .trim()
    .max(TAGS_MAX_LENGTH)
    .array()
    .max(MAX_TAGS)
    .optional()
    .default([]),
  image: z.object(mediaPropertiesWithErrors).optional()
})

export const updateRecipeSchema = z
  .object({
    title: z
      .string({
        invalid_type_error: "Title must be a string"
      })
      .trim()
      .min(TITLE_MIN_LENGTH, "Title cannot be empty")
      .max(
        TITLE_MAX_LENGTH,
        `Title cannot be greater than ${TITLE_MAX_LENGTH} characters`
      )
      .optional(),
    description: z
      .string({
        invalid_type_error: "Description must be a string"
      })
      .trim()
      .max(
        DESCRIPTION_MAX_LENGTH,
        `Description cannot be greater than ${DESCRIPTION_MAX_LENGTH} characters`
      )
      .optional(),
    prepTime: z
      .number({
        invalid_type_error: "Prep time must be a number"
      })
      .int("Prep time must be an integer")
      .min(0, "Prep time cannot be negative")
      .optional(),
    cookTime: z
      .number({
        invalid_type_error: "Cook time must be a number"
      })
      .int("Cook time must be an integer")
      .min(0, "Cook time cannot be negative")
      .optional(),
    servings: z
      .number({
        invalid_type_error: "Servings must be a number"
      })
      .int("Servings must be an integer")
      .min(1, "Servings must be at least 1")
      .optional(),
    difficulty: z
      .enum(DIFFICULTY_OPTIONS, {
        message: "Difficulty must be one of: Easy, Medium, Hard"
      })
      .optional(),
    category: z
      .string({
        invalid_type_error: "Category must be a string"
      })
      .trim()
      .max(
        CATEGORY_MAX_LENGTH,
        `Category cannot be greater than ${CATEGORY_MAX_LENGTH} characters`
      )
      .optional(),
    ingredients: z
      .array(
        z.object({
          name: z.string(),
          quantity: z.number(),
          unit: z.string()
        })
      )
      .min(1, "At least one ingredient is required")
      .optional(),
    instructions: z
      .array(z.string())
      .min(1, "At least one instruction is required")
      .optional(),
    tags: z
      .string({
        invalid_type_error: "Tags must be a string"
      })
      .trim()
      .max(TAGS_MAX_LENGTH)
      .array()
      .max(MAX_TAGS)
      .optional(),
    image: z.object(mediaPropertiesWithErrors).optional()
  })
  .refine(
    data => Object.keys(data).length > 0,
    "You must provide at least one field to update"
  )

export const createRecipeCommentSchema = z.object({
  text: z
    .string({
      required_error: "Text is required",
      invalid_type_error: "Text must be a string"
    })
    .trim()
    .min(1, "Text cannot be empty")
    .max(280, "Text cannot be greater than 280 characters")
})

export const recipeParamsSchema = z.object(recipeId)

export const recipesQuerySchema = sortAndPaginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional()
})

export type CreateRecipeSchema = z.infer<typeof createRecipeSchema>
export type UpdateRecipeSchema = z.infer<typeof updateRecipeSchema>
export type CreateRecipeCommentSchema = z.infer<
  typeof createRecipeCommentSchema
>
