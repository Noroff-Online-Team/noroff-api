import { FastifyInstance } from "fastify"

import { $ref } from "./jokes.schema"
import {
  getJokesHandler,
  getJokeHandler,
  getRandomJokeHandler
} from "./jokes.controller"

async function jokeRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["jokes"],
        response: {
          200: {
            type: "array",
            items: $ref("jokeSchema")
          }
        }
      }
    },
    getJokesHandler
  )

  server.get(
    "/random",
    {
      schema: {
        tags: ["jokes"],
        response: {
          200: $ref("jokeSchema")
        }
      }
    },
    getRandomJokeHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["jokes"],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: $ref("jokeSchema")
        }
      }
    },
    getJokeHandler
  )
}

export default jokeRoutes
