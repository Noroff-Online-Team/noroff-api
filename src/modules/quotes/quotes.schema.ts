import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

const quoteSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  author: z.string(),
  tags: z.string().array(),
  authorId: z.string(),
  authorSlug: z.string(),
  length: z.number().int()
})

export type QuoteSchema = z.infer<typeof quoteSchema>

export const { schemas: quoteSchemas, $ref } = buildJsonSchemas(
  { quoteSchema },
  { $id: "Quotes" }
)
