import { FastifyInstance } from "fastify"

import { quoteSchema, quoteParamsSchema } from "./quotes.schema"
import { createResponseSchema } from "@/utils/createResponseSchema"
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
          200: createResponseSchema(quoteSchema.array())
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
          200: createResponseSchema(quoteSchema)
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
          200: createResponseSchema(quoteSchema)
        }
      }
    },
    getQuoteHandler
  )
}

export default quotesRoutes
