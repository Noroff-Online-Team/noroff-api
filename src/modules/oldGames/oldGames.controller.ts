import { FastifyReply, FastifyRequest } from "fastify"

import { getOldGames, getOldGame, getRandomOldGame } from "./oldGames.services"

export async function getOldGamesHandler() {
  const oldGames = await getOldGames()
  return oldGames
}

export async function getOldGameHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const oldGame = await getOldGame(id)

  if (!oldGame) {
    const error = new Error("No old game with such ID")
    return reply.code(404).send(error)
  }

  return oldGame
}

export async function getRandomOldGameHandler() {
  const oldGame = await getRandomOldGame()
  return oldGame
}
