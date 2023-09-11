import { FastifyRequest } from "fastify"
import { OldGame } from "@prisma-api-v2/client"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { oldGameParamsSchema } from "./oldGames.schema"
import { sortAndPaginationSchema } from "@/utils"

import { getOldGames, getOldGame, getRandomOldGame } from "./oldGames.service"

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
  try {
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
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getOldGameHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  try {
    const params = oldGameParamsSchema.parse(request.params)
    const { id } = params

    const oldGame = await getOldGame(id)

    if (!oldGame.data) {
      throw new NotFound("No old game with such ID")
    }

    return oldGame
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

export async function getRandomOldGameHandler() {
  try {
    const oldGame = await getRandomOldGame()

    if (!oldGame.data) {
      throw new NotFound("Couldn't find any old games.")
    }

    return oldGame
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
