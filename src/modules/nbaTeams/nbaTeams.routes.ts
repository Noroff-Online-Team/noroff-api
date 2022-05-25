import { FastifyInstance } from "fastify"

import { $ref } from "./nbaTeams.schema"
import {
  getNbaTeamsHandler,
  getNbaTeamHandler,
  getRandomNbaTeamHandler
} from "./nbaTeams.controller"

async function nbaTeamRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["nba-teams"],
        response: {
          200: {
            type: "array",
            items: $ref("nbaTeamSchema")
          }
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
          200: $ref("nbaTeamSchema")
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
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: $ref("nbaTeamSchema")
        }
      }
    },
    getNbaTeamHandler
  )
}

export default nbaTeamRoutes
