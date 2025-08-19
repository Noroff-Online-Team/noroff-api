import { z } from "zod"
import { createSortAndPaginationSchema, type sortOrderSchema } from "./api"

// Media properties based on v2 API auth schema
export const mediaProperties = {
  url: z.string().url(),
  alt: z.string().optional()
}

// Book schema based on v2 API books.schema.ts
export const bookSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  author: z.string(),
  genre: z.string(),
  description: z.string(),
  isbn: z.string(),
  image: z.object(mediaProperties).optional(),
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

// Media schema
export const mediaSchema = z.object(mediaProperties)

// Sortable fields single source of truth
export const sortableBookFields = [
  "id",
  "title",
  "author",
  "genre",
  "description",
  "isbn",
  "published",
  "publisher"
] as const

export const sortableBookFieldSchema = z.enum(sortableBookFields)

export const booksQuerySchema = createSortAndPaginationSchema({
  sortableFields: sortableBookFields
})

// TypeScript types inferred from schemas
export type Book = z.infer<typeof bookSchema>
export type BookParams = z.infer<typeof bookParamsSchema>
export type Media = z.infer<typeof mediaSchema>
export type SortableBookField = z.infer<typeof sortableBookFieldSchema>
export type SortOrder = z.infer<typeof sortOrderSchema>
export type BooksQueryParams = z.infer<typeof booksQuerySchema>
