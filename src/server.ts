import path from "path"
import Fastify from "fastify"
import cors from "@fastify/cors"
import swagger from "@fastify/swagger"
import fStatic from "@fastify/static"
import { version } from "../package.json"

// Route imports
import statusRoutes from "./modules/status/status.routes"
import bookRoutes from "./modules/books/books.routes"
import catFactRoutes from "./modules/catFacts/catFacts.routes"
import jokeRoutes from "./modules/jokes/jokes.routes"
import nbaTeamRoutes from "./modules/nbaTeams/nbaTeams.routes"

// Schema imports
import { statusSchemas } from "./modules/status/status.schema"
import { bookSchemas } from "./modules/books/books.schema"
import { catFactSchemas } from "./modules/catFacts/catFacts.schema"
import { jokeSchemas } from "./modules/jokes/jokes.schema"
import { nbaTeamSchemas } from "./modules/nbaTeams/nbaTeams.schema"

const allSchemas = [
  ...statusSchemas,
  ...bookSchemas,
  ...catFactSchemas,
  ...jokeSchemas,
  ...nbaTeamSchemas
]

// Main startup
function buildServer() {
  const server = Fastify()

  // Enable cors
  server.register(cors, {
    origin: "*"
  })

  // Register schemas so they can be referenced in our routes
  for (const schema of allSchemas) {
    server.addSchema(schema)
  }

  // Register and generate swagger docs
  server.register(swagger, {
    swagger: {
      info: {
        title: "Noroff API",
        description: "Noroff API to be used in assignments",
        version
      },
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "status", description: "Health check endpoint" },
        { name: "books", description: "Books related endpoints" },
        { name: "cat-facts", description: "Cat Facts related endpoints" },
        { name: "jokes", description: "Jokes related endpoints" },
        { name: "nba-teams", description: "NBA teams related endpoints" }
      ]
    },
    routePrefix: "/docs",
    exposeRoute: true,
    staticCSP: true
  })

  // Register static serving of files
  server.register(fStatic, {
    root: path.join(__dirname, "public")
  })

  // Register all routes along with their given prefix
  server.register(statusRoutes, { prefix: "status" })
  server.register(bookRoutes, { prefix: "api/v1/books" })
  server.register(catFactRoutes, { prefix: "api/v1/cat-facts" })
  server.register(jokeRoutes, { prefix: "api/v1/jokes" })
  server.register(nbaTeamRoutes, { prefix: "api/v1/nba-teams" })

  return server
}

export default buildServer
