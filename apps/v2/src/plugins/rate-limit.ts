import type { FastifyRequest } from "fastify"
import rateLimit from "@fastify/rate-limit"
import type { UserProfile } from "@prisma/v2-client"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.register(rateLimit, {
    max: 600,
    timeWindow: "10 minutes",
    keyGenerator: (req: FastifyRequest) => {
      const user = req.user as Pick<UserProfile, "name"> | null
      const trueClientIp = (req.headers["true-client-ip"] as string) || req.ip
      const userAgent = req.headers["user-agent"] as string

      return user ? `${trueClientIp}-${userAgent}-${user.name}` : `${trueClientIp}-${userAgent}`
    }
  })
})
