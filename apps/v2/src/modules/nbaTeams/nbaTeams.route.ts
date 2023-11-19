import { FastifyInstance } from "fastify"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"

import { getNbaTeamHandler, getNbaTeamsHandler, getRandomNbaTeamHandler } from "./nbaTeams.controller"
import { nbaTeamParamsSchema, nbaTeamSchema } from "./nbaTeams.schema"

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
