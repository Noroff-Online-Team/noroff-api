import { FastifyInstance } from "fastify"

import { createProfileResponseSchema, createProfileSchema } from "../profiles/profiles.schema"
import { loginHandler, registerProfileHandler } from "./auth.controller"
import { loginResponseSchema, loginSchema } from "./auth.schema"

async function holidazeAuthRoutes(server: FastifyInstance) {
  server.post(
    "/register",
    {
      schema: {
        tags: ["holidaze-auth"],
        body: createProfileSchema,
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
        tags: ["holidaze-auth"],
        body: loginSchema,
        response: {
          200: loginResponseSchema
        }
      }
    },
    loginHandler
  )
}

export default holidazeAuthRoutes
