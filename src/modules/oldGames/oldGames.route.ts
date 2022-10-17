import { FastifyInstance } from "fastify"

import { oldGameResponseSchema, oldGameParamsSchema } from "./oldGames.schema"
import { getOldGamesHandler, getOldGameHandler, getRandomOldGameHandler } from "./oldGames.controller"

async function oldGameRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["old-games"],
        response: {
          200: oldGameResponseSchema.array()
        }
      }
    },
    getOldGamesHandler
  )

  server.get(
    "/random",
    {
      schema: {
        tags: ["old-games"],
        response: {
          200: oldGameResponseSchema
        }
      }
    },
    getRandomOldGameHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["old-games"],
        params: oldGameParamsSchema,
        response: {
          200: oldGameResponseSchema
        }
      }
    },
    getOldGameHandler
  )
}

export default oldGameRoutes
