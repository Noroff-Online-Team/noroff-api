import { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getNbaTeams, getNbaTeam, getRandomNbaTeam } from "./nbaTeams.service"

export async function getNbaTeamsHandler() {
  const nbaTeams = await getNbaTeams()
  return nbaTeams
}

export async function getNbaTeamHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const { id } = request.params
  const nbaTeam = await getNbaTeam(id)

  if (!nbaTeam) {
    throw new NotFound("No NBA team with such ID")
  }

  return nbaTeam
}

export async function getRandomNbaTeamHandler() {
  const nbaTeam = await getRandomNbaTeam()
  return nbaTeam
}
