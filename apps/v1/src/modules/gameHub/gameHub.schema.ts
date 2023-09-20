import { z } from "zod"

export const gameHubResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  genre: z.string(),
  released: z.string(),
  ageRating: z.string(),
  price: z.number(),
  discountedPrice: z.number(),
  onSale: z.boolean(),
  image: z.string(),
  tags: z.array(z.string()),
  favorite: z.boolean()
})

export const gameHubParamsSchema = z.object({
  id: z.string().uuid()
})

export type GameHubSchema = z.infer<typeof gameHubResponseSchema>
