import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createArtworkHandler,
  deleteArtworkHandler,
  getArtworkHandler,
  getArtworksHandler,
  updateArtworkHandler
} from "./artworks.controller"
import {
  artworkIdSchema,
  artworksQuerySchema,
  createArtworkSchema,
  displayArtworkSchema,
  updateArtworkSchema
} from "./artworks.schema"

async function artworksRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["artworks"],
        querystring: artworksQuerySchema,
        response: {
          200: createResponseSchema(displayArtworkSchema.array())
        }
      }
    },
    getArtworksHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["artworks"],
        params: artworkIdSchema,
        response: {
          200: createResponseSchema(displayArtworkSchema)
        }
      }
    },
    getArtworkHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["artworks"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createArtworkSchema,
        response: {
          201: createResponseSchema(displayArtworkSchema)
        }
      }
    },
    createArtworkHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["artworks"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: artworkIdSchema,
        body: updateArtworkSchema,
        response: {
          200: createResponseSchema(displayArtworkSchema)
        }
      }
    },
    updateArtworkHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["artworks"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: artworkIdSchema
      }
    },
    deleteArtworkHandler
  )
}

export default artworksRoutes
