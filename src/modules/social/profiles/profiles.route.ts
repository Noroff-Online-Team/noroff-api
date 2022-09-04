import { FastifyInstance } from "fastify"

import { $ref } from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  updateProfileMediaHandler,
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
}

export default profilesRoutes
