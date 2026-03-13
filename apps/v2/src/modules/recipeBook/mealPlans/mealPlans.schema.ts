import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import { mediaProperties, profileCore } from "../../auth/auth.schema"

const MEAL_TYPE_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const

const mealPlanId = {
  id: z
    .string({
      invalid_type_error: "ID must be a string",
      required_error: "ID is required"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
}

export const displayMealPlanSchema = z.object({
  ...mealPlanId,
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
  date: z.date(),
  mealType: z.string(),
  owner: z.object(profileCore),
  created: z.date()
})

export const createMealPlanSchema = z.object({
  recipeId: z
    .string({
      required_error: "Recipe ID is required",
      invalid_type_error: "Recipe ID must be a string"
    })
    .uuid({
      message: "Recipe ID must be a valid UUID"
    }),
  date: z.preprocess(
    arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    },
    z.date({ required_error: "Date is required" })
  ),
  mealType: z.enum(MEAL_TYPE_OPTIONS, {
    message: "Meal type must be one of: Breakfast, Lunch, Dinner, Snack"
  })
})

export const mealPlanParamsSchema = z.object(mealPlanId)

export const mealPlansQuerySchema = sortAndPaginationSchema.extend({
  startDate: z
    .preprocess(arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    }, z.date())
    .optional(),
  endDate: z
    .preprocess(arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    }, z.date())
    .optional()
})

export type CreateMealPlanSchema = z.infer<typeof createMealPlanSchema>
