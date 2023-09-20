import { z } from "zod"

export const quoteSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  author: z.string(),
  tags: z.string().array(),
  authorId: z.string(),
  authorSlug: z.string(),
  length: z.number().int()
})

export const quoteParamsSchema = z.object({
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

export type QuoteSchema = z.infer<typeof quoteSchema>
