import { z } from "zod"

export const bookResponseSchema = z.object({
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
  id: z.preprocess(val => parseInt(val as string, 10), z.number({
    invalid_type_error: "ID parameter must be a number"
  }).int())
})

export type BookSchema = z.infer<typeof bookResponseSchema>
