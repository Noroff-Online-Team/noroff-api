import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { OldGame } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { oldGameParamsSchema } from "./oldGames.schema"
import { getOldGame, getOldGames, getRandomOldGame } from "./oldGames.service"

export async function getOldGamesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof OldGame
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await sortAndPaginationSchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const oldGames = await getOldGames(sort, sortOrder, limit, page)

  if (!oldGames.data.length) {
    throw new NotFound("Couldn't find any old games.")
  }

  return oldGames
}

export async function getOldGameHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const params = oldGameParamsSchema.parse(request.params)
  const { id } = params

  const oldGame = await getOldGame(id)

  if (!oldGame.data) {
    throw new NotFound("No old game with such ID")
  }

  return oldGame
}

export async function getRandomOldGameHandler() {
  const oldGame = await getRandomOldGame()

  if (!oldGame.data) {
    throw new NotFound("Couldn't find any old games.")
  }

  return oldGame
}
