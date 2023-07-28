import { FastifyInstance } from "fastify"

import { gameHubSchema, gameHubParamsSchema } from "./gameHub.schema"
import { createResponseSchema } from "@/utils/createResponseSchema"
import { getGameHubProductsHandler, getGameHubProductHandler } from "./gameHub.controller"

async function gameHubRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
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
