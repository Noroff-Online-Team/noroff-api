import { FastifyRequest } from "fastify"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.decorate("authenticate", async (request: FastifyRequest) => {
    await request.jwtVerify()
  })
})
