import path from "path"
import fp from "fastify-plugin"
import fStatic from "@fastify/static"

export default fp(async fastify => {
  fastify.register(fStatic, {
    root: path.join(__dirname, "public")
  })
})
