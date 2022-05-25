import { FastifyInstance } from "fastify"

import { $ref } from "./oldGames.schema"
import {
  getOldGamesHandler,
  getOldGameHandler,
  getRandomOldGameHandler
} from "./oldGames.controller"

async function oldGameRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["old-games"],
        response: {
          200: {
            type: "array",
            items: $ref("oldGameSchema")
          }
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
          200: $ref("oldGameSchema")
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
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: $ref("oldGameSchema")
        }
      }
    },
    getOldGameHandler
  )
}

export default oldGameRoutes
