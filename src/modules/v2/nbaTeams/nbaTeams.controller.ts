import { FastifyRequest } from "fastify"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { nbaTeamParamsSchema } from "./nbaTeams.schema"

import { getNbaTeams, getNbaTeam, getRandomNbaTeam } from "./nbaTeams.service"

export async function getNbaTeamsHandler() {
  try {
    const nbaTeams = await getNbaTeams()

    if (!nbaTeams.data.length) {
      throw new NotFound("Couldn't find any NBA teams.")
    }

    return nbaTeams
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getNbaTeamHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  try {
    const params = nbaTeamParamsSchema.parse(request.params)
    const { id } = params

    const nbaTeam = await getNbaTeam(id)

    if (!nbaTeam.data) {
      throw new NotFound("No NBA team with such ID")
    }

    return nbaTeam
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

export async function getRandomNbaTeamHandler() {
  try {
    const nbaTeam = await getRandomNbaTeam()

    if (!nbaTeam.data) {
      throw new NotFound("Couldn't find any NBA teams.")
    }

    return nbaTeam
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
