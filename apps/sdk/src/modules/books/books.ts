import type { z } from "zod"
import {
  createArrayResponseSchema,
  createSingleItemResponseSchema
} from "../../types/api"
import type { BooksQueryParams } from "../../types/books"
import {
  bookParamsSchema,
  bookSchema,
  booksQuerySchema
} from "../../types/books"
import type { HTTPClient } from "../../utils/http-client"

// Zod schemas for book responses
export const booksArrayResponseSchema = createArrayResponseSchema(bookSchema)
export const singleBookResponseSchema =
  createSingleItemResponseSchema(bookSchema)

// Infer TypeScript types directly from Zod schemas
export type BooksArrayResponse = z.infer<typeof booksArrayResponseSchema>
export type SingleBookResponse = z.infer<typeof singleBookResponseSchema>

export class BooksModule {
  constructor(private client: HTTPClient) {}

  /**
   * Get all books with optional pagination and sorting
   */
  async getAll(params?: BooksQueryParams): Promise<BooksArrayResponse> {
    const parsedParams = params ? booksQuerySchema.parse(params) : undefined
    const response = await this.client.get<BooksArrayResponse>(
      "/books",
      parsedParams
    )
    return booksArrayResponseSchema.parse(response)
  }

  /**
   * Get a random book
   */
  async getRandom(): Promise<SingleBookResponse> {
    const response = await this.client.get<SingleBookResponse>("/books/random")
    return singleBookResponseSchema.parse(response)
  }

  /**
   * Get a specific book by ID
   */
  async getById(id: number): Promise<SingleBookResponse> {
    const { id: parsedId } = bookParamsSchema.parse({ id })
    const response = await this.client.get<SingleBookResponse>(
      `/books/${parsedId}`
    )
    return singleBookResponseSchema.parse(response)
  }
}
