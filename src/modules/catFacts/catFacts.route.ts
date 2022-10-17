import { FastifyInstance } from "fastify"

import { catFactResponseSchema, catFactParamsSchema } from "./catFacts.schema"
import { getCatFactsHandler, getCatFactHandler, getRandomCatFactHandler } from "./catFacts.controller"

async function catFactsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["cat-facts"],
        response: {
          200: catFactResponseSchema.array()
        }
      }
    },
    getCatFactsHandler
  )

  server.get(
    "/random",
    {
      schema: {
        tags: ["cat-facts"],
        response: {
          200: catFactResponseSchema
        }
      }
    },
    getRandomCatFactHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["cat-facts"],
        params: catFactParamsSchema,
        response: {
          200: catFactResponseSchema
        }
      }
    },
    getCatFactHandler
  )
}

export default catFactsRoutes
