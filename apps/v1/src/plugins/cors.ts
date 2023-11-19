import cors from "@fastify/cors"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.register(cors, {
    origin: "*"
  })
})
