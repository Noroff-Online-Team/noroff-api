import { createRoute, z } from "@hono/zod-openapi"
import {
  createResponseSchema,
  sortAndPaginationSchema
} from "@noroff/api-utils"

import { jsonResponse } from "@/helpers/response-schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { bookParamsSchema, bookSchema } from "./books.schema"

const tags = ["books"]

const errorSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
      path: z.array(z.union([z.string(), z.number()])).optional()
    })
  ),
  status: z.string(),
  statusCode: z.number()
})

export const list = createRoute({
  path: "/books",
  method: "get",
  tags,
  request: {
    query: sortAndPaginationSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonResponse(
      createResponseSchema(bookSchema.array()),
      "List of books"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonResponse(
      errorSchema,
      "Invalid query parameters"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonResponse(errorSchema, "No books found")
  }
})

export const getOne = createRoute({
  path: "/books/{id}",
  method: "get",
  tags,
  request: {
    params: bookParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonResponse(
      createResponseSchema(bookSchema),
      "Single book"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonResponse(errorSchema, "Invalid book ID"),
    [HttpStatusCodes.NOT_FOUND]: jsonResponse(errorSchema, "Book not found")
  }
})

// Get random book route
export const getRandom = createRoute({
  path: "/books/random",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonResponse(
      createResponseSchema(bookSchema),
      "Random book"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonResponse(errorSchema, "No books found")
  }
})

export type ListRoute = typeof list
export type GetOneRoute = typeof getOne
export type GetRandomRoute = typeof getRandom
