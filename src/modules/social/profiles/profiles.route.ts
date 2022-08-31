import { FastifyInstance } from "fastify"

import { $ref } from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  createProfileHandler
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
      preHandler: [server.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["title", "body"],
          properties: {
            title: { type: "string" },
            body: { type: "string" },
            media: { type: "string" },
            tags: { type: "array" }
          }
        },
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
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
          required: ["title", "body"],
          properties: {
            title: { type: "string" },
            body: { type: "string" },
            media: { type: "string" },
            tags: { type: "array" }
          }
        },
        tags: ["profiles"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("profileSchema")
        }
      }
    },
    createProfileHandler
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
