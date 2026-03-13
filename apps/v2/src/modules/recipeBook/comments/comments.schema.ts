import { z } from "zod"

import { profileCore } from "../../auth/auth.schema"

const commentId = {
  id: z
    .string({
      invalid_type_error: "ID must be a string",
      required_error: "ID is required"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
}

export const displayCommentSchema = z.object({
  ...commentId,
  text: z.string(),
  recipeId: z.string(),
  author: z.object(profileCore),
  created: z.date(),
  updated: z.date()
})

export const updateCommentSchema = z.object({
  text: z
    .string({
      required_error: "Text is required",
      invalid_type_error: "Text must be a string"
    })
    .trim()
    .min(1, "Text cannot be empty")
    .max(280, "Text cannot be greater than 280 characters")
})

export const commentParamsSchema = z.object(commentId)

export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>
