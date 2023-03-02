import { FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.send(err)
    }
  })
})
