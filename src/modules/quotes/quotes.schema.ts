import { z } from "zod"

export const quoteResponseSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  author: z.string(),
  tags: z.string().array(),
  authorId: z.string(),
  authorSlug: z.string(),
  length: z.number().int()
})

export const quoteParamsSchema = z.object({
  id: z.number().int()
})

export type QuoteSchema = z.infer<typeof quoteResponseSchema>
