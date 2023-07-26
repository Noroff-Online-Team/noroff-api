import { FastifyRequest } from "fastify"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { oldGameParamsSchema } from "./oldGames.schema"

import { getOldGames, getOldGame, getRandomOldGame } from "./oldGames.service"

export async function getOldGamesHandler() {
  try {
    const oldGames = await getOldGames()

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
