import { FastifyInstance } from "fastify"

import { gameHubResponseSchema, gameHubParamsSchema } from "./gameHub.schema"
import { getGameHubProductsHandler, getGameHubProductHandler } from "./gameHub.controller"

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
