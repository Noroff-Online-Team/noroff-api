import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createFavoriteHandler,
  deleteFavoriteHandler,
  getFavoritesHandler
} from "./favorites.controller"
import {
  createFavoriteSchema,
  displayFavoriteSchema,
  favoriteParamsSchema,
  favoritesQuerySchema
} from "./favorites.schema"

async function favoritesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-favorites"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: favoritesQuerySchema,
        response: {
          200: createResponseSchema(displayFavoriteSchema.array())
        }
      }
    },
    getFavoritesHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-favorites"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createFavoriteSchema,
        response: {
          201: createResponseSchema(displayFavoriteSchema)
        }
      }
    },
    createFavoriteHandler
  )

  server.delete(
    "/:recipeId",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-favorites"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: favoriteParamsSchema
      }
    },
    deleteFavoriteHandler
  )
}

export default favoritesRoutes
