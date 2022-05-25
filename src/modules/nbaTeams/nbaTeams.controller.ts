import { FastifyReply, FastifyRequest } from "fastify"

import { getNbaTeams, getNbaTeam, getRandomNbaTeam } from "./nbaTeams.services"

export async function getNbaTeamsHandler() {
  const nbaTeams = await getNbaTeams()
  return nbaTeams
}

export async function getNbaTeamHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const nbaTeam = await getNbaTeam(id)

  if (!nbaTeam) {
    const error = new Error("No NBA team with such ID")
    return reply.code(404).send(error)
  }

  return nbaTeam
}

export async function getRandomNbaTeamHandler() {
  const nbaTeam = await getRandomNbaTeam()
  return nbaTeam
}
