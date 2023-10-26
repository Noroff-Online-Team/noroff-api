import fp from "fastify-plugin"
import { createLogger } from "@noroff/logger"

const logger = createLogger({ label: "API-v2" })

export default fp(async fastify => {
  fastify.addHook("onError", (req, reply, error, next) => {
    logger.error({
      id: req.id,
      url: req.url,
      method: req.method,
      body: req.body || {},
      hostname: req.hostname,
      remoteAdderss: req.ip,
      headers: {
        authorization: req.headers.authorization || null,
        "x-noroff-api-key": req.headers["x-noroff-api-key"] || null,
        "x-forwarded-for": req.headers["true-client-ip"] || req.ip
      },
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })
    return next()
  })

  fastify.addHook("onResponse", (req, reply, next) => {
    logger.info({
      id: req.id,
      url: req.url,
      method: req.method,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime()
    })
    return next()
  })

  fastify.addHook("onRequest", (req, reply, next) => {
    logger.info({
      id: req.id,
      url: req.url,
      method: req.method,
      body: req.body || {},
      hostname: req.hostname,
      remoteAdderss: req.ip,
      headers: {
        authorization: req.headers.authorization || null,
        "x-noroff-api-key": req.headers["x-noroff-api-key"] || null,
        "x-forwarded-for": req.headers["true-client-ip"] || req.ip
      }
    })
    return next()
  })
})
