import { FastifyInstance } from "fastify"

import { getListingsHandler, getListingHandler } from "./listings.controller"
import { listingQuerySchema, listingResponseSchema, queryFlagsSchema, listingIdParamsSchema } from "./listings.schema"

async function listingsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
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
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-listings"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: listingIdParamsSchema,
        response: {
          200: listingResponseSchema
        }
      }
    },
    getListingHandler
  )
}

export default listingsRoutes
