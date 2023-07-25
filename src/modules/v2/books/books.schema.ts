import { z } from "zod"

export const bookSchema = z.object({
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

export const bookParamsSchema = z.object({
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

export type BookSchema = z.infer<typeof bookSchema>
