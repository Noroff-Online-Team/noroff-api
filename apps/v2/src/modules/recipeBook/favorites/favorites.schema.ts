import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { mediaProperties, profileCore } from "../../auth/auth.schema"

const favoriteId = {
  id: z
    .string({
      invalid_type_error: "ID must be a string",
      required_error: "ID is required"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
}

export const displayFavoriteSchema = z.object({
  ...favoriteId,
  recipeId: z.string(),
  recipe: z.object({
    id: z.string(),
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
    created: z.date(),
    updated: z.date()
  }),
  owner: z.object(profileCore),
  created: z.date()
})

export const createFavoriteSchema = z.object({
  recipeId: z
    .string({
      required_error: "Recipe ID is required",
      invalid_type_error: "Recipe ID must be a string"
    })
    .uuid({
      message: "Recipe ID must be a valid UUID"
    })
})

export const favoriteParamsSchema = z.object({
  recipeId: z
    .string({
      invalid_type_error: "Recipe ID must be a string",
      required_error: "Recipe ID is required"
    })
    .uuid({
      message: "Recipe ID must be a valid UUID"
    })
})

export const favoritesQuerySchema = sortAndPaginationSchema

export type CreateFavoriteSchema = z.infer<typeof createFavoriteSchema>
