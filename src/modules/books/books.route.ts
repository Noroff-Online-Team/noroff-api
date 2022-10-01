import { FastifyInstance } from "fastify"

import { bookResponseSchema, bookParamsSchema } from "./books.schema"
import { getBooksHandler, getBookHandler, getRandomBookHandler } from "./books.controller"

async function bookRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["books"],
        response: {
          200: bookResponseSchema
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
