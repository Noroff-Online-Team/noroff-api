import { FastifyRequest } from "fastify"
import { NbaTeam } from "@prisma/v2-client"
import { NotFound, BadRequest } from "http-errors"
import { nbaTeamParamsSchema } from "./nbaTeams.schema"
import { sortAndPaginationSchema } from "@noroff/api-utils"

import { getNbaTeams, getNbaTeam, getRandomNbaTeam } from "./nbaTeams.service"

export async function getNbaTeamsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof NbaTeam
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

    const nbaTeams = await getNbaTeams(sort, sortOrder, limit, page)

    if (!nbaTeams.data.length) {
      throw new NotFound("Couldn't find any NBA teams.")
    }

    return nbaTeams
  } catch (error) {
    throw error
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
    throw error
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
    throw error
  }
}
