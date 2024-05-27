import type { FastifyInstance } from "fastify"

import {
  getCatFactHandler,
  getCatFactsHandler,
  getRandomCatFactHandler
} from "./catFacts.controller"
import { catFactParamsSchema, catFactResponseSchema } from "./catFacts.schema"

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
