import { FastifyInstance } from "fastify"
import { loginHandler, registerProfileHandler } from "./auth.controller"
import { loginBodySchema, loginResponseSchema } from "./auth.schema"
import { createProfileBodySchema, createProfileResponseSchema } from "./auth.schema"

async function authRoutes(server: FastifyInstance) {
  server.post(
    "/register",
    {
      schema: {
        tags: ["auth"],
        body: createProfileBodySchema,
        response: {
          201: createProfileResponseSchema
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
          200: loginResponseSchema
        }
      }
    },
    loginHandler
  )
}

export default authRoutes
