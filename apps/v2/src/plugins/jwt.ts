import jwt from "@fastify/jwt"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET as string
  })
})
