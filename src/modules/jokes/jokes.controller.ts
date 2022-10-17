import { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getJokes, getJoke, getRandomJoke } from "./jokes.service"

export async function getJokesHandler() {
  const jokes = await getJokes()
  return jokes
}

export async function getJokeHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const { id } = request.params
  const joke = await getJoke(id)

  if (!joke) {
    throw new NotFound("No joke with such ID")
  }

  return joke
}

export async function getRandomJokeHandler() {
  const joke = await getRandomJoke()
  return joke
}
