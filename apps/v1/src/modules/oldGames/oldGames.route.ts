import type { FastifyInstance } from "fastify"

import {
  getOldGameHandler,
  getOldGamesHandler,
  getRandomOldGameHandler
} from "./oldGames.controller"
import { oldGameParamsSchema, oldGameResponseSchema } from "./oldGames.schema"

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
