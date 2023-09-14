import { FastifyInstance } from "fastify"

import {
  getListingsHandler,
  getListingHandler,
  createListingHandler,
  updateListingHandler,
  deleteListingHandler,
  createListingBidHandler,
  searchListingsHandler
} from "./listings.controller"
import {
  listingQuerySchema,
  listingResponseSchema,
  queryFlagsSchema,
  listingIdParamsSchema,
  createListingSchema,
  updateListingSchema,
  bidBodySchema,
  searchQuerySchema
} from "./listings.schema"
import { createResponseSchema } from "@/utils/createResponseSchema"

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
