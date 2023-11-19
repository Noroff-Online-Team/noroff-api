import { z } from "zod"

import { mediaProperties } from "../auth/auth.schema"

export const squareEyesSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  genre: z.string(),
  rating: z.string(),
  released: z.string(),
  price: z.number(),
  discountedPrice: z.number(),
  onSale: z.boolean(),
  image: z.object(mediaProperties),
  tags: z.array(z.string()),
  favorite: z.boolean()
})

export const squareEyesParamsSchema = z.object({
  id: z
    .string({
      required_error: "ID is required",
      invalid_type_error: "ID must be a string"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
})

export type SquareEyesSchema = z.infer<typeof squareEyesSchema>
