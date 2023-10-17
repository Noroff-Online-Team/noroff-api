import fp from "fastify-plugin"
import swaggerUi from "@fastify/swagger-ui"

export default fp(async fastify => {
  fastify.register(swaggerUi, {
    routePrefix: "/docs",
    staticCSP: true
  })
})
