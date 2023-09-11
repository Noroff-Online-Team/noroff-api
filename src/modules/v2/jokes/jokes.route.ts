import { FastifyInstance } from "fastify"

import { jokeSchema, jokeParamsSchema } from "./jokes.schema"
import { createResponseSchema, sortAndPaginationSchema } from "@/utils"
import { getJokesHandler, getJokeHandler, getRandomJokeHandler } from "./jokes.controller"

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
