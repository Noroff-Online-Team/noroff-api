import type { FastifyInstance } from "fastify"

export default async function (fastify: FastifyInstance) {
  fastify.register(import("./books/books.route"), { prefix: "books" })
}
