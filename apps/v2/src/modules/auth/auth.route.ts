import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createApiKeyHandler,
  loginHandler,
  registerProfileHandler
} from "./auth.controller"
import {
  createApiKeyResponseSchema,
  createApiKeySchema,
  createProfileBodySchema,
  createProfileResponseSchema,
  loginBodySchema,
  loginQuerySchema,
  loginResponseSchema
} from "./auth.schema"

async function authRoutes(server: FastifyInstance) {
  server.post(
    "/register",
    {
      schema: {
        tags: ["auth"],
        body: createProfileBodySchema,
        response: {
          201: createResponseSchema(createProfileResponseSchema)
        }
      }
    },
    registerProfileHandler
  )

  server.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        body: loginBodySchema,
        querystring: loginQuerySchema,
        response: {
          200: createResponseSchema(loginResponseSchema)
        }
      }
    },
    loginHandler
  )

  server.post(
    "/create-api-key",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["auth"],
        body: createApiKeySchema,
        response: {
          201: createResponseSchema(createApiKeyResponseSchema)
        }
      }
    },
    createApiKeyHandler
  )
}

export default authRoutes
