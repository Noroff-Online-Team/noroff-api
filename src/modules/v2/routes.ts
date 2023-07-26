import type { FastifyInstance } from "fastify"

export default async function (fastify: FastifyInstance) {
  fastify.register(import("./books/books.route"), { prefix: "books" })
  fastify.register(import("./catFacts/catFacts.route"), { prefix: "cat-facts" })
  fastify.register(import("./jokes/jokes.route"), { prefix: "jokes" })
  fastify.register(import("./nbaTeams/nbaTeams.route"), { prefix: "nba-teams" })
  fastify.register(import("./oldGames/oldGames.route"), { prefix: "old-games" })
  fastify.register(import("./quotes/quotes.route"), { prefix: "quotes" })
}
