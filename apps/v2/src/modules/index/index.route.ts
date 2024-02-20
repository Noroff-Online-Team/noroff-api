import { FastifyInstance } from "fastify"

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
        message: "Welcome to the Noroff API v2!",
        github: "https://github.com/Noroff-Online-Team/noroff-api",
        docs: "https://docs.noroff.dev/docs/v2",
        swagger: "https://v2.api.noroff.dev/docs"
      }
    }
  )
}

export default indexRoutes
