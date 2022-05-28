import { FastifyInstance } from "fastify"

import { $ref } from "./catFacts.schema"
import {
  getCatFactsHandler,
  getCatFactHandler,
  getRandomCatFactHandler
} from "./catFacts.controller"

async function catFactsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["cat-facts"],
        response: {
          200: {
            type: "array",
            items: $ref("catFactSchema")
          }
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
          200: $ref("catFactSchema")
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
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: $ref("catFactSchema")
        }
      }
    },
    getCatFactHandler
  )
}

export default catFactsRoutes
