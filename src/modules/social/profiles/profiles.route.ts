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
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
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
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
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
