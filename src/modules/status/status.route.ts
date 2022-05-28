import { FastifyInstance } from "fastify"

async function statusRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["status"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" }
            }
          }
        }
      }
    },
    async () => {
      return { status: "OK" }
    }
  )
}

export default statusRoutes
