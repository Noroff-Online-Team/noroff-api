import { FastifyInstance } from "fastify"

import { loginSchema, authResponseSchema } from "./auth.schema"
import { getTokenHandler } from "./auth.controller"

async function authRoutes(server: FastifyInstance) {
  server.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        body: loginSchema,
        response: {
          200: authResponseSchema
        }
      }
    },
    getTokenHandler
  )
}

export default authRoutes
