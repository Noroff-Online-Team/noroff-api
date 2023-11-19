import metrics from "fastify-metrics"
import fp from "fastify-plugin"

export default fp(async fastify => {
  fastify.register(metrics, {
    endpoint: "/metrics"
  })
})
