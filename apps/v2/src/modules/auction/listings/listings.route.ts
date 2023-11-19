import { FastifyInstance } from "fastify"
import { createResponseSchema } from "@noroff/api-utils"

import {
  createListingBidHandler,
  createListingHandler,
  deleteListingHandler,
  getListingHandler,
  getListingsHandler,
  searchListingsHandler,
  updateListingHandler
} from "./listings.controller"
import {
  bidBodySchema,
  createListingSchema,
  listingIdParamsSchema,
  listingQuerySchema,
  listingResponseSchema,
  queryFlagsSchema,
  searchQuerySchema,
  updateListingSchema
} from "./listings.schema"

async function listingsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["auction-listings"],
        querystring: listingQuerySchema,
        response: {
          200: createResponseSchema(listingResponseSchema.array())
        }
      }
    },
    getListingsHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["auction-listings"],
        querystring: queryFlagsSchema,
        params: listingIdParamsSchema,
        response: {
          200: createResponseSchema(listingResponseSchema)
        }
      }
    },
    getListingHandler
  )

  server.get(
    "/search",
    {
      schema: {
        tags: ["auction-listings"],
        querystring: searchQuerySchema,
        response: {
          200: createResponseSchema(listingResponseSchema.array())
        }
      }
    },
    searchListingsHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
        body: createListingSchema,
        response: {
          201: createResponseSchema(listingResponseSchema)
        }
      }
    },
    createListingHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
        body: updateListingSchema,
        querystring: queryFlagsSchema,
        params: listingIdParamsSchema,
        response: {
          200: createResponseSchema(listingResponseSchema)
        }
      }
    },
    updateListingHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
        params: listingIdParamsSchema
      }
    },
    deleteListingHandler
  )

  server.post(
    "/:id/bids",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
        params: listingIdParamsSchema,
        querystring: queryFlagsSchema,
        body: bidBodySchema,
        response: {
          201: createResponseSchema(listingResponseSchema)
        }
      }
    },
    createListingBidHandler
  )
}

export default listingsRoutes
