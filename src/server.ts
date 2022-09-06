import path from "path"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import cors from "@fastify/cors"
import swagger from "@fastify/swagger"
import fStatic from "@fastify/static"
import fJwt from '@fastify/jwt'
import fAuth from '@fastify/auth'
import fRateLimit from '@fastify/rate-limit'

import swaggerOptions from './config/swagger'

// Route imports
import statusRoutes from "./modules/status/status.route"
import authRoutes from './modules/auth/auth.route'
import bookRoutes from "./modules/books/books.route"
import catFactRoutes from "./modules/catFacts/catFacts.route"
import jokeRoutes from "./modules/jokes/jokes.route"
import nbaTeamRoutes from "./modules/nbaTeams/nbaTeams.route"
import oldGameRoutes from "./modules/oldGames/oldGames.route"
import quotesRoutes from './modules/quotes/quotes.route'
import postsRoutes from "./modules/social/posts/posts.route"
import profilesRoutes from "./modules/social/profiles/profiles.route"
import socialAuthRoutes from "./modules/social/auth/auth.route"

// Schema imports
import { statusSchemas } from "./modules/status/status.schema"
import { authSchemas } from './modules/auth/auth.schema'
import { bookSchemas } from "./modules/books/books.schema"
import { catFactSchemas } from "./modules/catFacts/catFacts.schema"
import { jokeSchemas } from "./modules/jokes/jokes.schema"
import { nbaTeamSchemas } from "./modules/nbaTeams/nbaTeams.schema"
import { oldGameSchemas } from "./modules/oldGames/oldGames.schema"
import { quoteSchemas } from './modules/quotes/quotes.schema'
import { postSchemas } from "./modules/social/posts/posts.schema"
import { profileSchemas } from "./modules/social/profiles/profiles.schema"
import { socialAuthSchemas } from "./modules/social/auth/auth.schema"

const allSchemas = [
  ...statusSchemas,
  ...authSchemas,
  ...bookSchemas,
  ...catFactSchemas,
  ...jokeSchemas,
  ...nbaTeamSchemas,
  ...oldGameSchemas,
  ...quoteSchemas,
  ...postSchemas,
  ...profileSchemas,
  ...socialAuthSchemas
]

// Main startup
function buildServer() {
  const server = Fastify()

  // Register rate-limit
  server.register(fRateLimit, {
    max: 30,
    timeWindow: '1 minute',
  })

  // Register CORS
  server.register(cors, {
    origin: "*"
  })

  // Register static serving of files
  server.register(fStatic, {
    root: path.join(__dirname, "public")
  })

  // Register JWT
  server.register(fJwt, {
    secret: process.env.JWT_SECRET as string
  })

  // Register Auth
  server.register(fAuth)

  server.addContentTypeParser('application/json', {parseAs: 'string'}, (_request, body, done) => {
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
    req.jwt = server.jwt;
    return next();
  });

  // Register schemas so they can be referenced in our routes
  for (const schema of allSchemas) {
    server.addSchema(schema)
  }

  // Register and generate swagger docs
  server.register(swagger, swaggerOptions)

  // Register all routes along with their given prefix
  server.register(statusRoutes, { prefix: "status" })
  server.register(authRoutes, { prefix: "api/v1/auth" })
  server.register(bookRoutes, { prefix: "api/v1/books" })
  server.register(catFactRoutes, { prefix: "api/v1/cat-facts" })
  server.register(jokeRoutes, { prefix: "api/v1/jokes" })
  server.register(nbaTeamRoutes, { prefix: "api/v1/nba-teams" })
  server.register(oldGameRoutes, { prefix: "api/v1/old-games" })
  server.register(quotesRoutes, { prefix: "api/v1/quotes" })
  server.register(postsRoutes, { prefix: "api/v1/social/posts" })
  server.register(profilesRoutes, { prefix: "api/v1/social/profiles" })
  server.register(socialAuthRoutes, { prefix: "api/v1/social/auth" })

  return server
}

export default buildServer
