import { z } from "zod"

import { mediaProperties } from "../auth/auth.schema"

export const rainyDaysSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  gender: z.string(),
  sizes: z.array(z.string()),
  baseColor: z.string(),
  price: z.number(),
  discountedPrice: z.number(),
  onSale: z.boolean(),
  image: z.object(mediaProperties),
  tags: z.array(z.string()),
  favorite: z.boolean()
})

export const rainyDaysParamsSchema = z.object({
  id: z
    .string({
      required_error: "ID is required",
      invalid_type_error: "ID must be a string"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
})

export type RainyDaysSchema = z.infer<typeof rainyDaysSchema>
