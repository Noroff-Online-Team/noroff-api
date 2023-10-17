import { FastifyInstance } from "fastify"

import {
  getListingsHandler,
  getListingHandler,
  createListingHandler,
  updateListingHandler,
  deleteListingHandler,
  createListingBidHandler
} from "./listings.controller"
import {
  listingQuerySchema,
  listingResponseSchema,
  queryFlagsSchema,
  listingIdParamsSchema,
  createListingSchema,
  updateListingSchema,
  bidBodySchema
} from "./listings.schema"

async function listingsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["auction-listings"],
        querystring: listingQuerySchema,
        response: {
          200: listingResponseSchema.array()
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
          200: listingResponseSchema
        }
      }
    },
    getListingHandler
  )

  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
        body: createListingSchema,
        response: {
          201: listingResponseSchema
        }
      }
    },
    createListingHandler
  )

  server.put(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
        body: updateListingSchema,
        querystring: queryFlagsSchema,
        params: listingIdParamsSchema,
        response: {
          200: listingResponseSchema
        }
      }
    },
    updateListingHandler
  )

  server.delete(
    "/:id",
    {
      preHandler: [server.authenticate],
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
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
        params: listingIdParamsSchema,
        querystring: queryFlagsSchema,
        body: bidBodySchema,
        response: {
          200: listingResponseSchema
        }
      }
    },
    createListingBidHandler
  )
}

export default listingsRoutes
