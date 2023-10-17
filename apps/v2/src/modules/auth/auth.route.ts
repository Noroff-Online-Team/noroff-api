import { FastifyInstance } from "fastify"
import { loginHandler, registerProfileHandler, createApiKeyHandler } from "./auth.controller"
import {
  loginBodySchema,
  loginResponseSchema,
  createProfileBodySchema,
  createProfileResponseSchema,
  createApiKeyResponseSchema,
  createApiKeySchema
} from "./auth.schema"
import { createResponseSchema } from "@noroff/api-utils"

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
