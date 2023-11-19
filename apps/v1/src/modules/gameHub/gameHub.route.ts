import { FastifyInstance } from "fastify"

import { getGameHubProductHandler, getGameHubProductsHandler } from "./gameHub.controller"
import { gameHubParamsSchema, gameHubResponseSchema } from "./gameHub.schema"

async function gameHubRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
        response: {
          200: gameHubResponseSchema.array()
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
          200: gameHubResponseSchema
        }
      }
    },
    getGameHubProductHandler
  )
}

export default gameHubRoutes
