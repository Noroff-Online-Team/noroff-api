import { FastifyInstance } from "fastify"

import { statusResponseSchema } from "./status.schema"

async function statusRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["status"],
        response: {
          200: statusResponseSchema
        }
      }
    },
    async () => {
      return { status: "OK" }
    }
  )
}

export default statusRoutes
