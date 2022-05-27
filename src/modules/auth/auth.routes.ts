import { FastifyInstance } from "fastify"

import { $ref } from "./auth.schema"
import { getTokenHandler } from "./auth.controller"

async function authRoutes(server: FastifyInstance) {
  server.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        body: $ref("loginSchema"),
        response: {
          200: $ref("authResponseSchema")
        }
      }
    },
    getTokenHandler
  )
}

export default authRoutes
