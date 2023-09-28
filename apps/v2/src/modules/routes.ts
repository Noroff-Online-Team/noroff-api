import type { FastifyInstance } from "fastify"

export default async function (fastify: FastifyInstance) {
  fastify.register(import("./status/status.route"), { prefix: "status" })
  fastify.register(import("./books/books.route"), { prefix: "books" })
  fastify.register(import("./catFacts/catFacts.route"), { prefix: "cat-facts" })
  fastify.register(import("./jokes/jokes.route"), { prefix: "jokes" })
  fastify.register(import("./nbaTeams/nbaTeams.route"), { prefix: "nba-teams" })
  fastify.register(import("./oldGames/oldGames.route"), { prefix: "old-games" })
  fastify.register(import("./onlineShop/onlineShop.route"), { prefix: "online-shop" })
  fastify.register(import("./quotes/quotes.route"), { prefix: "quotes" })
  fastify.register(import("./rainyDays/rainyDays.route"), { prefix: "rainy-days" })
  fastify.register(import("./squareEyes/squareEyes.route"), { prefix: "square-eyes" })
  fastify.register(import("./gameHub/gameHub.route"), { prefix: "gamehub" })
  fastify.register(import("./auth/auth.route"), { prefix: "auth" })
  fastify.register(import("./social/posts/posts.route"), { prefix: "social/posts" })
  fastify.register(import("./social/profiles/profiles.route"), { prefix: "social/profiles" })
  fastify.register(import("./auction/listings/listings.route"), { prefix: "auction/listings" })
  fastify.register(import("./auction/profiles/profiles.route"), { prefix: "auction/profiles" })
  fastify.register(import("./holidaze/venues/venues.route"), { prefix: "holidaze/venues" })
  fastify.register(import("./holidaze/bookings/bookings.route"), { prefix: "holidaze/bookings" })
  fastify.register(import("./holidaze/profiles/profiles.route"), { prefix: "holidaze/profiles" })
}
