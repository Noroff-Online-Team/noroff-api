import { FastifyInstance } from "fastify"

import { getRainyDaysProductHandler, getRainyDaysProductsHandler } from "./rainyDays.controller"
import { rainyDaysParamsSchema, rainyDaysResponseSchema } from "./rainyDays.schema"

async function rainyDaysRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
        response: {
          200: rainyDaysResponseSchema.array()
        }
      }
    },
    getRainyDaysProductsHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["e-com"],
        params: rainyDaysParamsSchema,
        response: {
          200: rainyDaysResponseSchema
        }
      }
    },
    getRainyDaysProductHandler
  )
}

export default rainyDaysRoutes
