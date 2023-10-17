import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.addHook("preHandler", (req, reply, next) => {
    req.jwt = fastify.jwt
    return next()
  })
})
