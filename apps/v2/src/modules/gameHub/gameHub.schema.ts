import { z } from "zod"

import { mediaProperties } from "../auth/auth.schema"

export const gameHubSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  genre: z.string(),
  released: z.string(),
  ageRating: z.string(),
  price: z.number(),
  discountedPrice: z.number(),
  onSale: z.boolean(),
  image: z.object(mediaProperties),
  tags: z.array(z.string()),
  favorite: z.boolean()
})

export const gameHubParamsSchema = z.object({
  id: z
    .string({
      required_error: "ID is required",
      invalid_type_error: "ID must be a string"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
})

export type GameHubSchema = z.infer<typeof gameHubSchema>
