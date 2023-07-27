import { FastifyInstance } from "fastify"

import { rainyDaysSchema, rainyDaysParamsSchema } from "./rainyDays.schema"
import { createResponseSchema } from "@/utils/createResponseSchema"
import { getRainyDaysProductsHandler, getRainyDaysProductHandler } from "./rainyDays.controller"

async function rainyDaysRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
        response: {
          200: createResponseSchema(rainyDaysSchema.array())
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
          200: createResponseSchema(rainyDaysSchema)
        }
      }
    },
    getRainyDaysProductHandler
  )
}

export default rainyDaysRoutes
