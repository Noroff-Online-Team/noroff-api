import { FastifyInstance } from "fastify"
import { loginHandler, registerProfileHandler } from "./auth.controller"
import { loginSchema, loginResponseSchema } from "./auth.schema"
import { createProfileSchema, createProfileResponseSchema } from "../profiles/profiles.schema"

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
