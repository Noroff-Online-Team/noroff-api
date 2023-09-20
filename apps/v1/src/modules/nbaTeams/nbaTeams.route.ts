import { FastifyInstance } from "fastify"

import { nbaTeamResponseSchema, nbaTeamParamsSchema } from "./nbaTeams.schema"
import { getNbaTeamsHandler, getNbaTeamHandler, getRandomNbaTeamHandler } from "./nbaTeams.controller"

async function nbaTeamRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["nba-teams"],
        response: {
          200: nbaTeamResponseSchema.array()
        }
      }
    },
    getNbaTeamsHandler
  )

  server.get(
    "/random",
    {
      schema: {
        tags: ["nba-teams"],
        response: {
          200: nbaTeamResponseSchema
        }
      }
    },
    getRandomNbaTeamHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["nba-teams"],
        params: nbaTeamParamsSchema,
        response: {
          200: nbaTeamResponseSchema
        }
      }
    },
    getNbaTeamHandler
  )
}

export default nbaTeamRoutes
