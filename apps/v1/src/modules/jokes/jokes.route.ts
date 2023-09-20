import { FastifyInstance } from "fastify"

import { jokeResponseSchema, jokeParamsSchema } from "./jokes.schema"
import { getJokesHandler, getJokeHandler, getRandomJokeHandler } from "./jokes.controller"

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
