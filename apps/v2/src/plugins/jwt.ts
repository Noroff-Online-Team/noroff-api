import fp from "fastify-plugin"
import jwt from "@fastify/jwt"

export default fp(async fastify => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET as string
  })
})
