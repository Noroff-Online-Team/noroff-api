import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { NbaTeam } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { nbaTeamParamsSchema } from "./nbaTeams.schema"
import { getNbaTeam, getNbaTeams, getRandomNbaTeam } from "./nbaTeams.service"

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
}

export async function getNbaTeamHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const params = nbaTeamParamsSchema.parse(request.params)
  const { id } = params

  const nbaTeam = await getNbaTeam(id)

  if (!nbaTeam.data) {
    throw new NotFound("No NBA team with such ID")
  }

  return nbaTeam
}

export async function getRandomNbaTeamHandler() {
  const nbaTeam = await getRandomNbaTeam()

  if (!nbaTeam.data) {
    throw new NotFound("Couldn't find any NBA teams.")
  }

  return nbaTeam
}
