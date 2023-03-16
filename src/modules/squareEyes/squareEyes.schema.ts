import { z } from "zod"

export const squareEyesResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  genre: z.string(),
  rating: z.string(),
  value: z.string(),
  released: z.string(),
  price: z.number(),
  discountedPrice: z.number(),
  onSale: z.boolean(),
  image: z.string(),
  tags: z.array(z.string()),
  favorite: z.boolean()
})

export const squareEyesParamsSchema = z.object({
  id: z.string().uuid()
})

export type SquareEyesSchema = z.infer<typeof squareEyesResponseSchema>
