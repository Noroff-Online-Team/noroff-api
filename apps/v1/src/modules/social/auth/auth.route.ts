import type { FastifyInstance } from "fastify"

import {
  createProfileResponseSchema,
  createProfileSchema
} from "../profiles/profiles.schema"
import { loginHandler, registerProfileHandler } from "./auth.controller"
import { loginResponseSchema, loginSchema } from "./auth.schema"

async function socialAuthRoutes(server: FastifyInstance) {
  server.post(
    "/register",
    {
      schema: {
        tags: ["social-auth"],
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
        tags: ["social-auth"],
        body: loginSchema,
        response: {
          200: loginResponseSchema
        }
      }
    },
    loginHandler
  )
}

export default socialAuthRoutes
