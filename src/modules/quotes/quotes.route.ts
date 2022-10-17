import { FastifyInstance } from "fastify"

import { quoteResponseSchema, quoteParamsSchema } from "./quotes.schema"
import { getQuotesHandler, getQuoteHandler, getRandomQuoteHandler } from "./quotes.controller"

async function quotesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["quotes"],
        security: [{ bearerAuth: [] }],
        response: {
          200: quoteResponseSchema.array()
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
          200: quoteResponseSchema
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
        params: quoteParamsSchema,
        response: {
          200: quoteResponseSchema
        }
      }
    },
    getQuoteHandler
  )
}

export default quotesRoutes
