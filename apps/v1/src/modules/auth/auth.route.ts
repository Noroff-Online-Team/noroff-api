import { FastifyInstance } from "fastify"

import { getTokenHandler } from "./auth.controller"
import { authResponseSchema, loginSchema } from "./auth.schema"

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
