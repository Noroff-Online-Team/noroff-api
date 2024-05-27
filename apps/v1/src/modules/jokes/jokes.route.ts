import type { FastifyInstance } from "fastify"

import {
  getJokeHandler,
  getJokesHandler,
  getRandomJokeHandler
} from "./jokes.controller"
import { jokeParamsSchema, jokeResponseSchema } from "./jokes.schema"

async function jokeRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["jokes"],
        response: {
          200: jokeResponseSchema.array()
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
          200: jokeResponseSchema
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
        params: jokeParamsSchema,
        response: {
          200: jokeResponseSchema
        }
      }
    },
    getJokeHandler
  )
}

export default jokeRoutes
