import { z } from "zod"

export const substitutionsRequestSchema = z.object({
  ingredient: z
    .string({
      required_error: "Ingredient is required",
      invalid_type_error: "Ingredient must be a string"
    })
    .trim()
    .min(1, "Ingredient cannot be empty")
})

export const substitutionsResponseSchema = z.object({
  ingredient: z.string(),
  substitutions: z.array(
    z.object({
      name: z.string(),
      ratio: z.string(),
      notes: z.string()
    })
  )
})

export const scaleRequestSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string({
        required_error: "Ingredient name is required"
      }),
      quantity: z.number({
        required_error: "Ingredient quantity is required"
      }),
      unit: z.string({
        required_error: "Ingredient unit is required"
      })
    }),
    {
      required_error: "Ingredients are required"
    }
  ),
  originalServings: z
    .number({
      required_error: "Original servings is required",
      invalid_type_error: "Original servings must be a number"
    })
    .int()
    .min(1, "Original servings must be at least 1"),
  targetServings: z
    .number({
      required_error: "Target servings is required",
      invalid_type_error: "Target servings must be a number"
    })
    .int()
    .min(1, "Target servings must be at least 1")
})

export const scaleResponseSchema = z.object({
  originalServings: z.number(),
  targetServings: z.number(),
  scaleFactor: z.number(),
  scaledIngredients: z.array(
    z.object({
      name: z.string(),
      originalQuantity: z.number(),
      scaledQuantity: z.number(),
      unit: z.string()
    })
  ),
  tips: z.array(z.string())
})

export const generateRequestSchema = z.object({
  prompt: z
    .string({
      required_error: "Prompt is required",
      invalid_type_error: "Prompt must be a string"
    })
    .trim()
    .min(1, "Prompt cannot be empty")
    .max(500, "Prompt cannot be greater than 500 characters")
})

export const generateResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  prepTime: z.number(),
  cookTime: z.number(),
  servings: z.number(),
  difficulty: z.string(),
  category: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string()
    })
  ),
  instructions: z.array(z.string()),
  tags: z.array(z.string())
})

export type SubstitutionsRequest = z.infer<typeof substitutionsRequestSchema>
export type ScaleRequest = z.infer<typeof scaleRequestSchema>
export type GenerateRequest = z.infer<typeof generateRequestSchema>
