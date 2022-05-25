import { FastifyReply, FastifyRequest } from "fastify"

import { getJokes, getJoke, getRandomJoke } from "./jokes.service"

export async function getJokesHandler() {
  const jokes = await getJokes()
  return jokes
}

export async function getJokeHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const joke = await getJoke(id)

  if (!joke) {
    const error = new Error("No joke with such ID")
    return reply.code(404).send(error)
  }

  return joke
}

export async function getRandomJokeHandler() {
  const joke = await getRandomJoke()
  return joke
}
