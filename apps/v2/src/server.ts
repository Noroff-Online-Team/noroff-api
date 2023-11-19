import path from "path"
import Fastify from "fastify"
import autoLoad from "@fastify/autoload"
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod"

import errorHandler from "./exceptions/errorHandler"
import notFoundHandler from "./exceptions/notFoundHandler"
import routes from "./modules/routes"

// Main startup
function buildServer() {
  const server = Fastify({
    // Allows routes to end with a slash instead of throwing a 404
    ignoreTrailingSlash: true
  }).withTypeProvider<ZodTypeProvider>()

  // Set custom validator and serializer compilers for Zod
  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  // Register plugins
  server.register(autoLoad, {
    dir: path.join(__dirname, "plugins")
  })

  // Register hooks
  server.register(autoLoad, {
    dir: path.join(__dirname, "hooks")
  })

  // Register decorators
  server.register(autoLoad, {
    dir: path.join(__dirname, "decorators")
  })

  // Set custom error handler
  server.setErrorHandler(errorHandler)

  // Set custom not found handler to match our error format
  server.setNotFoundHandler(notFoundHandler)

  // Register all routes
  server.register(routes)

  return server
}

export default buildServer

export type ServerType = ReturnType<typeof buildServer>
