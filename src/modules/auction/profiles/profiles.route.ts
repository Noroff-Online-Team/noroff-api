import { FastifyInstance } from "fastify"

import {
  displayProfileSchema,
  profilesQuerySchema,
  profileMediaSchema,
  profileNameSchema,
  queryFlagsSchema
} from "./profiles.schema"
import { getProfilesHandler, getProfileHandler, updateProfileMediaHandler } from "./profiles.controller"

async function profilesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        response: {
          200: displayProfileSchema.array()
        }
      }
    },
    getProfilesHandler
  )

  server.get(
    "/:name",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: profileNameSchema,
        response: {
          200: displayProfileSchema
        }
      }
    },
    getProfileHandler
  )

  server.put(
    "/:name/media",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        body: profileMediaSchema,
        response: {
          200: displayProfileSchema
        }
      }
    },
    updateProfileMediaHandler
  )
}

export default profilesRoutes
