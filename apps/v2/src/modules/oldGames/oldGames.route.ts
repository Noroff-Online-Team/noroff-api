import { FastifyInstance } from "fastify"

import { oldGameSchema, oldGameParamsSchema } from "./oldGames.schema"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"
import { getOldGamesHandler, getOldGameHandler, getRandomOldGameHandler } from "./oldGames.controller"

async function oldGameRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["old-games"],
        querystring: sortAndPaginationSchema,
        response: {
          200: createResponseSchema(oldGameSchema.array())
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
          200: createResponseSchema(oldGameSchema)
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
          200: createResponseSchema(oldGameSchema)
        }
      }
    },
    getOldGameHandler
  )
}

export default oldGameRoutes
