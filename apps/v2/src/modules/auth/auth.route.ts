import { FastifyInstance } from "fastify"
import { createResponseSchema } from "@noroff/api-utils"

import { createApiKeyHandler, loginHandler, registerProfileHandler } from "./auth.controller"
import {
  createApiKeyResponseSchema,
  createApiKeySchema,
  createProfileBodySchema,
  createProfileResponseSchema,
  loginBodySchema,
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
