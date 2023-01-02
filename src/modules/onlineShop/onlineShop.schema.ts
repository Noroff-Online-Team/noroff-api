import { z } from "zod"

export const onlineShopResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  discountedPrice: z.number(),
  imageUrl: z.string(),
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
  id: z.string().uuid()
})

export type OnlineShopSchema = z.infer<typeof onlineShopResponseSchema>
