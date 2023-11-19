import type { FastifyRequest } from "fastify"
import rateLimit from "@fastify/rate-limit"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.register(rateLimit, {
    max: 600,
    timeWindow: "10 minutes",
    keyGenerator: (req: FastifyRequest) => (req.headers["true-client-ip"] as string) || req.ip
  })
})
