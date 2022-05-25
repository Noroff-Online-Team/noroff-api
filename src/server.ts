import path from "path"
import Fastify from "fastify"
import cors from "@fastify/cors"
import swagger from "@fastify/swagger"
import fStatic from "@fastify/static"
import { version } from "../package.json"

// Route imports
import bookRoutes from "./modules/books/books.routes"
import catFactRoutes from "./modules/catFacts/catFacts.routes"

// Schema imports
import { bookSchemas } from "./modules/books/books.schema"
import { catFactSchemas } from "./modules/catFacts/catFacts.schema"

const allSchemas = [...bookSchemas, ...catFactSchemas]

// Main startup
function buildServer() {
  const server = Fastify()

  // Enable cors
  server.register(cors, {
    origin: "*"
  })

  // Healthcheck endpoint
  server.get("/status", async () => {
    return { status: "OK" }
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
        { name: "books", description: "Books related endpoints" },
        { name: "cat-facts", description: "Cat Facts related endpoints" }
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
  server.register(bookRoutes, { prefix: "api/v1/books" })
  server.register(catFactRoutes, { prefix: "api/v1/cat-facts" })

  return server
}

export default buildServer
