import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { Joke } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { jokeParamsSchema } from "./jokes.schema"
import { getJoke, getJokes, getRandomJoke } from "./jokes.service"

export async function getJokesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof Joke
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await sortAndPaginationSchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const jokes = await getJokes(sort, sortOrder, limit, page)

  if (!jokes.data.length) {
    throw new NotFound("Couldn't find any jokes.")
  }

  return jokes
}

export async function getJokeHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const params = jokeParamsSchema.parse(request.params)
  const { id } = params

  const joke = await getJoke(id)

  if (!joke.data) {
    throw new NotFound("No joke with such ID")
  }

  return joke
}

export async function getRandomJokeHandler() {
  const joke = await getRandomJoke()

  if (!joke.data) {
    throw new NotFound("Couldn't find any jokes.")
  }

  return joke
}
