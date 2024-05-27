import type { FastifyInstance } from "fastify"

import {
  getNbaTeamHandler,
  getNbaTeamsHandler,
  getRandomNbaTeamHandler
} from "./nbaTeams.controller"
import { nbaTeamParamsSchema, nbaTeamResponseSchema } from "./nbaTeams.schema"

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
