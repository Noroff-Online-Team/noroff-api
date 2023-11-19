import { FastifyInstance } from "fastify"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"

import { getJokeHandler, getJokesHandler, getRandomJokeHandler } from "./jokes.controller"
import { jokeParamsSchema, jokeSchema } from "./jokes.schema"

async function jokeRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["jokes"],
        querystring: sortAndPaginationSchema,
        response: {
          200: createResponseSchema(jokeSchema.array())
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
          200: createResponseSchema(jokeSchema)
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
          200: createResponseSchema(jokeSchema)
        }
      }
    },
    getJokeHandler
  )
}

export default jokeRoutes
