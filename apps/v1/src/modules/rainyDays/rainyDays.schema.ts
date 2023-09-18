import { z } from "zod"

export const rainyDaysResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  gender: z.string(),
  sizes: z.array(z.string()),
  baseColor: z.string(),
  price: z.number(),
  discountedPrice: z.number(),
  onSale: z.boolean(),
  image: z.string(),
  tags: z.array(z.string()),
  favorite: z.boolean()
})

export const rainyDaysParamsSchema = z.object({
  id: z.string().uuid()
})

export type RainyDaysSchema = z.infer<typeof rainyDaysResponseSchema>
