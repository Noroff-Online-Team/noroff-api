import { FastifyInstance } from "fastify"

import { $ref } from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  updateProfileHandler
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
    "/:name",
    {
      preHandler: [server.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        },
        body: $ref("createProfileSchema"),
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("displayProfileSchema")
        }
      }
    },
    updateProfileHandler
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
