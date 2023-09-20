import { FastifyInstance } from "fastify"

import { catFactSchema, catFactParamsSchema } from "./catFacts.schema"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"
import { getCatFactsHandler, getCatFactHandler, getRandomCatFactHandler } from "./catFacts.controller"

async function catFactsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["cat-facts"],
        querystring: sortAndPaginationSchema,
        response: {
          200: createResponseSchema(catFactSchema.array())
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
          200: createResponseSchema(catFactSchema)
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
          200: createResponseSchema(catFactSchema)
        }
      }
    },
    getCatFactHandler
  )
}

export default catFactsRoutes
