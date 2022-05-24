import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

const bookSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  author: z.string(),
  genre: z.string(),
  description: z.string(),
  isbn: z.string(),
  image: z.string(),
  published: z.string(),
  publisher: z.string()
})

export type BookSchema = z.infer<typeof bookSchema>

export const { schemas: bookSchemas, $ref } = buildJsonSchemas(
  { bookSchema },
  { $id: "bookSchemas" }
)
