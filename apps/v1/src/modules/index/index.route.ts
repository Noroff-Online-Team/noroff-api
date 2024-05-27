import type { FastifyInstance } from "fastify"

async function indexRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        hide: true
      }
    },
    () => {
      return {
        message: "Welcome to the Noroff API v1!",
        github: "https://github.com/Noroff-Online-Team/noroff-api",
        docs: "https://docs.noroff.dev/docs/v1",
        swagger: "https://api.noroff.dev/docs"
      }
    }
  )
}

export default indexRoutes
