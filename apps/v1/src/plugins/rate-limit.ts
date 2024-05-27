import type { FastifyRequest } from "fastify"
import rateLimit from "@fastify/rate-limit"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.register(rateLimit, {
    max: 600,
    timeWindow: "10 minutes",
    keyGenerator: (req: FastifyRequest) => {
      const user = req.user as { name: string } | null
      const trueClientIp = (req.headers["true-client-ip"] as string) || req.ip
      const userAgent = req.headers["user-agent"] as string

      return user
        ? `${trueClientIp}-${userAgent}-${user.name}`
        : `${trueClientIp}-${userAgent}`
    }
  })
})
