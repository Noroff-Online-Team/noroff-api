import { FastifyInstance } from "fastify"

import { $ref } from "./profiles.schema"
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
        response: {
          200: {
            type: "array",
            items: $ref("displayProfileSchema")
          }
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
        params: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        },
        body: $ref("profileMediaSchema"),
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("displayProfileSchema")
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
        params: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        },
        response: {
          200: $ref("displayProfileSchema")
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
        params: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        },
        tags: ["profiles"],
        security: [{ bearerAuth: [] }]
      }
    },
    followProfileHandler
  )

  server.put(
    "/:name/unfollow",
    {
      preHandler: [server.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        },
        tags: ["profiles"],
        security: [{ bearerAuth: [] }]
      }
    },
    unfollowProfileHandler
  )
}

export default profilesRoutes
