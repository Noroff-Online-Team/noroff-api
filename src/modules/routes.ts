import type { FastifyInstance } from "fastify"

import authRoutes from "./auth/auth.route"
import bookRoutes from "./books/books.route"
import catFactRoutes from "./catFacts/catFacts.route"
import jokeRoutes from "./jokes/jokes.route"
import nbaTeamRoutes from "./nbaTeams/nbaTeams.route"
import oldGameRoutes from "./oldGames/oldGames.route"
import quotesRoutes from "./quotes/quotes.route"
import onlineShopRoutes from "./onlineShop/onlineShop.route"
import postsRoutes from "./social/posts/posts.route"
import profilesRoutes from "./social/profiles/profiles.route"
import socialAuthRoutes from "./social/auth/auth.route"
import auctionAuthRoutes from "./auction/auth/auth.route"
import auctionProfilesRoutes from "./auction/profiles/profiles.route"
import aucstionListingRoutes from "./auction/listings/listings.route"

export default async function (fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: "auth" })
  fastify.register(bookRoutes, { prefix: "books" })
  fastify.register(catFactRoutes, { prefix: "cat-facts" })
  fastify.register(jokeRoutes, { prefix: "jokes" })
  fastify.register(nbaTeamRoutes, { prefix: "nba-teams" })
  fastify.register(oldGameRoutes, { prefix: "old-games" })
  fastify.register(quotesRoutes, { prefix: "quotes" })
  fastify.register(onlineShopRoutes, { prefix: "online-shop" })
  fastify.register(postsRoutes, { prefix: "social/posts" })
  fastify.register(profilesRoutes, { prefix: "social/profiles" })
  fastify.register(socialAuthRoutes, { prefix: "social/auth" })
  fastify.register(auctionAuthRoutes, { prefix: "auction/auth" })
  fastify.register(auctionProfilesRoutes, { prefix: "auction/profiles" })
  fastify.register(aucstionListingRoutes, { prefix: "auction/listings" })
}
