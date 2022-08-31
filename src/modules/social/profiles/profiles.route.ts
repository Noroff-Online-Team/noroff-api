import { FastifyInstance } from "fastify"

import { $ref } from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  createProfileHandler,
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
            items: $ref("profileSchema")
          }
        }
      }
    },
    getProfilesHandler
  )

  server.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" }
          }
        },
        tags: ["profiles"],
        response: {
          200: $ref("profileSchema")
        }
      }
    },
    createProfileHandler
  )

  server.put(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" }
          }
        },
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("profileSchema")
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
          200: $ref("profileSchema")
        }
      }
    },
    getProfileHandler
  )
}

export default profilesRoutes
