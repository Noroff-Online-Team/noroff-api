import { FastifyInstance } from "fastify"

import { gameHubSchema, gameHubParamsSchema } from "./gameHub.schema"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"
import { getGameHubProductsHandler, getGameHubProductHandler } from "./gameHub.controller"

async function gameHubRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
        querystring: sortAndPaginationSchema,
        response: {
          200: createResponseSchema(gameHubSchema.array())
        }
      }
    },
    getGameHubProductsHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["e-com"],
        params: gameHubParamsSchema,
        response: {
          200: createResponseSchema(gameHubSchema)
        }
      }
    },
    getGameHubProductHandler
  )
}

export default gameHubRoutes
