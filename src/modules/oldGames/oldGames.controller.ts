import { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getOldGames, getOldGame, getRandomOldGame } from "./oldGames.service"

export async function getOldGamesHandler() {
  const oldGames = await getOldGames()
  return oldGames
}

export async function getOldGameHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const { id } = request.params
  const oldGame = await getOldGame(id)

  if (!oldGame) {
    throw new NotFound("No old game with such ID")
  }

  return oldGame
}

export async function getRandomOldGameHandler() {
  const oldGame = await getRandomOldGame()
  return oldGame
}
