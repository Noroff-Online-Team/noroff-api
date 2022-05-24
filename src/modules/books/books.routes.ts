import { FastifyInstance } from "fastify"

import { $ref } from "./books.schema"
import { getBooksHandler, getBookHandler } from "./books.controller"

async function bookRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["Books"],
        response: {
          200: {
            type: "array",
            items: $ref("bookSchema")
          }
        }
      }
    },
    getBooksHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["Books"],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: $ref("bookSchema")
        }
      }
    },
    getBookHandler
  )
}

export default bookRoutes
