import formBody from "@fastify/formbody"
import fp from "fastify-plugin"
import qs from "qs"

export default fp(async fastify => {
  fastify.register(formBody, {
    parser: (str: string) => qs.parse(str)
  })
})
