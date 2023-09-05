import { FastifyInstance } from "fastify"

import { rainyDaysSchema, rainyDaysParamsSchema } from "./rainyDays.schema"
import { createResponseSchema, sortAndPaginationSchema } from "@/utils"
import { getRainyDaysProductsHandler, getRainyDaysProductHandler } from "./rainyDays.controller"

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
