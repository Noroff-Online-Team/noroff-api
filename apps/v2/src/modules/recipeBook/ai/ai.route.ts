import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  generateRecipeHandler,
  getSubstitutionsHandler,
  scaleRecipeHandler
} from "./ai.controller"
import {
  generateRequestSchema,
  generateResponseSchema,
  scaleRequestSchema,
  scaleResponseSchema,
  substitutionsRequestSchema,
  substitutionsResponseSchema
} from "./ai.schema"

async function aiRoutes(server: FastifyInstance) {
  server.post(
    "/substitutions",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-ai"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: substitutionsRequestSchema,
        response: {
          200: createResponseSchema(substitutionsResponseSchema)
        }
      }
    },
    getSubstitutionsHandler
  )

  server.post(
    "/scale",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-ai"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: scaleRequestSchema,
        response: {
          200: createResponseSchema(scaleResponseSchema)
        }
      }
    },
    scaleRecipeHandler
  )

  server.post(
    "/generate",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-ai"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: generateRequestSchema,
        response: {
          200: createResponseSchema(generateResponseSchema)
        }
      }
    },
    generateRecipeHandler
  )
}

export default aiRoutes
