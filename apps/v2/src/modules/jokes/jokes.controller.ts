import { FastifyRequest } from "fastify"
import { Joke } from "@prisma/v2-client"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { jokeParamsSchema } from "./jokes.schema"
import { sortAndPaginationSchema } from "@noroff/api-utils"

import { getJokes, getJoke, getRandomJoke } from "./jokes.service"

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
  try {
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
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getJokeHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  try {
    const params = jokeParamsSchema.parse(request.params)
    const { id } = params

    const joke = await getJoke(id)

    if (!joke.data) {
      throw new NotFound("No joke with such ID")
    }

    return joke
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getRandomJokeHandler() {
  try {
    const joke = await getRandomJoke()

    if (!joke.data) {
      throw new NotFound("Couldn't find any jokes.")
    }

    return joke
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
