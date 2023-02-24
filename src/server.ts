import path from "path"
import Fastify from "fastify"
import autoLoad from "@fastify/autoload"
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod"
import statuses from "statuses"
import { ZodError, ZodIssueCode } from "zod"

import statusRoutes from "./modules/status/status.route"
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
  server.setErrorHandler((error, _request, reply) => {
    interface ParsedError {
      code: ZodIssueCode
      message: string
      path: Array<string | number>
    }

    const statusCode = error?.statusCode || 500
    let errors = [error] || "Something went wrong"

    if (error instanceof ZodError) {
      const parsedErrors = JSON.parse(error?.message).map((err: ParsedError) => ({
        code: err.code,
        message: err.message,
        path: err.path
      }))

      errors = parsedErrors
    }

    reply.code(statusCode).send({
      errors,
      status: statuses(statusCode) || "Unknown error",
      statusCode
    })
  })

  // Set custom not found handler to match our error format
  server.setNotFoundHandler((request, reply) => {
    const { url, method } = request.raw
    const statusCode = 404

    reply.code(statusCode).send({
      errors: [{ message: `Route ${method}:${url} not found` }],
      status: statuses(statusCode),
      statusCode
    })
  })

  // Register status route
  server.register(statusRoutes, { prefix: "status" })

  // Register all v1 routes
  server.register(routes, { prefix: "api/v1" })

  return server
}

export default buildServer
