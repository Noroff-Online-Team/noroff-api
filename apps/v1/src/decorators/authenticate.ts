import type { FastifyRequest } from "fastify"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.decorate("authenticate", async (request: FastifyRequest) => {
    try {
      await request.jwtVerify()
    } catch (error) {
      throw error
    }
  })
})
