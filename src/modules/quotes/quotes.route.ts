import { FastifyInstance } from "fastify"

import { $ref } from "./quotes.schema"
import {
  getQuotesHandler,
  getQuoteHandler,
  getRandomQuoteHandler
} from "./quotes.controller"

async function quotesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["quotes"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: $ref("quoteSchema")
          }
        }
      }
    },
    getQuotesHandler
  )

  server.get(
    "/random",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["quotes"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("quoteSchema")
        }
      }
    },
    getRandomQuoteHandler
  )

  server.get(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["quotes"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: $ref("quoteSchema")
        }
      }
    },
    getQuoteHandler
  )
}

export default quotesRoutes
