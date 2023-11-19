import { FastifyInstance } from "fastify"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"

import { getRainyDaysProductHandler, getRainyDaysProductsHandler } from "./rainyDays.controller"
import { rainyDaysParamsSchema, rainyDaysSchema } from "./rainyDays.schema"

async function rainyDaysRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
        querystring: sortAndPaginationSchema,
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
