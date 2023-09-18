import { FastifyInstance } from "fastify"

import { nbaTeamSchema, nbaTeamParamsSchema } from "./nbaTeams.schema"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"
import { getNbaTeamsHandler, getNbaTeamHandler, getRandomNbaTeamHandler } from "./nbaTeams.controller"

async function nbaTeamRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["nba-teams"],
        querystring: sortAndPaginationSchema,
        response: {
          200: createResponseSchema(nbaTeamSchema.array())
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
          200: createResponseSchema(nbaTeamSchema)
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
          200: createResponseSchema(nbaTeamSchema)
        }
      }
    },
    getNbaTeamHandler
  )
}

export default nbaTeamRoutes
