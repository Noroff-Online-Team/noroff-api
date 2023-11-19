import { z } from "zod"

import { mediaProperties } from "../auth/auth.schema"

export const onlineShopSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  discountedPrice: z.number(),
  image: z.object(mediaProperties),
  rating: z.number(),
  tags: z.array(z.string()),
  reviews: z
    .array(
      z.object({
        id: z.string().uuid(),
        username: z.string(),
        rating: z.number(),
        description: z.string()
      })
    )
    .nullish()
})

export const onlineShopParamsSchema = z.object({
  id: z
    .string({
      required_error: "ID is required",
      invalid_type_error: "ID must be a string"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
})

export type OnlineShopSchema = z.infer<typeof onlineShopSchema>
