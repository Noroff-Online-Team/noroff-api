import { FastifyInstance } from "fastify"

import { getBookHandler, getBooksHandler, getRandomBookHandler } from "./books.controller"
import { bookParamsSchema, bookResponseSchema } from "./books.schema"

async function bookRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["books"],
        response: {
          200: bookResponseSchema.array()
        }
      }
    },
    getBooksHandler
  )

  server.get(
    "/random",
    {
      schema: {
        tags: ["books"],
        response: {
          200: bookResponseSchema
        }
      }
    },
    getRandomBookHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["books"],
        params: bookParamsSchema,
        response: {
          200: bookResponseSchema
        }
      }
    },
    getBookHandler
  )
}

export default bookRoutes
