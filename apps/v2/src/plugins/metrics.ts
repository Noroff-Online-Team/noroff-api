import fp from "fastify-plugin"
import metrics from "fastify-metrics"

export default fp(async fastify => {
  fastify.register(metrics, {
    endpoint: "/metrics"
  })
})
