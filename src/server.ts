import path from "path"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import fStatic from "@fastify/static"
import fAuth from "@fastify/auth"
import fAutoLoad from "@fastify/autoload"
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod"
import statuses from "statuses"
import { ZodError, ZodIssueCode } from "zod"

// Route imports
import statusRoutes from "./modules/status/status.route"
import authRoutes from "./modules/auth/auth.route"
import bookRoutes from "./modules/books/books.route"
import catFactRoutes from "./modules/catFacts/catFacts.route"
import jokeRoutes from "./modules/jokes/jokes.route"
import nbaTeamRoutes from "./modules/nbaTeams/nbaTeams.route"
import oldGameRoutes from "./modules/oldGames/oldGames.route"
import quotesRoutes from "./modules/quotes/quotes.route"
import onlineShopRoutes from "./modules/onlineShop/onlineShop.route"
import postsRoutes from "./modules/social/posts/posts.route"
import profilesRoutes from "./modules/social/profiles/profiles.route"
import socialAuthRoutes from "./modules/social/auth/auth.route"
import auctionAuthRoutes from "./modules/auction/auth/auth.route"
import auctionProfilesRoutes from "./modules/auction/profiles/profiles.route"
import aucstionListingRoutes from "./modules/auction/listings/listings.route"

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
  server.register(fAutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, server)
  })

  // Register static serving of files
  server.register(fStatic, {
    root: path.join(__dirname, "public")
  })

  // Register Auth
  server.register(fAuth)

  server.addContentTypeParser("application/json", { parseAs: "string" }, (_request, body, done) => {
    if (!body) {
      done(null)
    }

    try {
      done(null, JSON.parse(body as string))
    } catch (error) {
      done(error as Error, undefined)
    }
  })

  // We add an "authenticate" decorator so we can add JWT to routes manually instead of adding it globally.
  server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.send(err)
    }
  })

  // Add JWT to the request object so we can access it in our controllers.
  server.addHook("preHandler", (req, reply, next) => {
    req.jwt = server.jwt
    return next()
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

  // Register all routes along with their given prefix
  server.register(statusRoutes, { prefix: "status" })
  server.register(authRoutes, { prefix: "api/v1/auth" })
  server.register(bookRoutes, { prefix: "api/v1/books" })
  server.register(catFactRoutes, { prefix: "api/v1/cat-facts" })
  server.register(jokeRoutes, { prefix: "api/v1/jokes" })
  server.register(nbaTeamRoutes, { prefix: "api/v1/nba-teams" })
  server.register(oldGameRoutes, { prefix: "api/v1/old-games" })
  server.register(quotesRoutes, { prefix: "api/v1/quotes" })
  server.register(onlineShopRoutes, { prefix: "api/v1/online-shop" })
  server.register(postsRoutes, { prefix: "api/v1/social/posts" })
  server.register(profilesRoutes, { prefix: "api/v1/social/profiles" })
  server.register(socialAuthRoutes, { prefix: "api/v1/social/auth" })
  server.register(auctionAuthRoutes, { prefix: "api/v1/auction/auth" })
  server.register(auctionProfilesRoutes, { prefix: "api/v1/auction/profiles" })
  server.register(aucstionListingRoutes, { prefix: "api/v1/auction/listings" })

  return server
}

export default buildServer
