import { FastifyInstance } from "fastify"

import { $ref } from "./catFacts.schema"
import { getCatFactsHandler, getCatFactHandler } from "./catFacts.controller"

async function catFactsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["Cat Facts"],
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
    "/:id",
    {
      schema: {
        tags: ["Cat Facts"],
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
