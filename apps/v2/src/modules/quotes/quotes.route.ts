import { FastifyInstance } from "fastify"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"

import { getQuoteHandler, getQuotesHandler, getRandomQuoteHandler } from "./quotes.controller"
import { quoteParamsSchema, quoteSchema } from "./quotes.schema"

async function quotesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["quotes"],
        security: [{ bearerAuth: [] }],
        querystring: sortAndPaginationSchema,
        response: {
          200: createResponseSchema(quoteSchema.array())
        }
      }
    },
    getQuotesHandler
  )

  server.get(
    "/random",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["quotes"],
        security: [{ bearerAuth: [] }],
        response: {
          200: createResponseSchema(quoteSchema)
        }
      }
    },
    getRandomQuoteHandler
  )

  server.get(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["quotes"],
        security: [{ bearerAuth: [] }],
        params: quoteParamsSchema,
        response: {
          200: createResponseSchema(quoteSchema)
        }
      }
    },
    getQuoteHandler
  )
}

export default quotesRoutes
