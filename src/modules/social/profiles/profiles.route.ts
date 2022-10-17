import { FastifyInstance } from "fastify"

import {
  displayProfileSchema,
  profilesQuerySchema,
  profileMediaSchema,
  profileNameSchema,
  queryFlagsSchema
} from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  updateProfileMediaHandler,
  followProfileHandler,
  unfollowProfileHandler
} from "./profiles.controller"

async function profilesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        response: {
          200: displayProfileSchema.array()
        }
      }
    },
    getProfilesHandler
  )

  server.put(
    "/:name/media",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["profiles"],
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

  server.get(
    "/:name",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["profiles"],
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
    "/:name/follow",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema
      }
    },
    followProfileHandler
  )

  server.put(
    "/:name/unfollow",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema
      }
    },
    unfollowProfileHandler
  )
}

export default profilesRoutes
