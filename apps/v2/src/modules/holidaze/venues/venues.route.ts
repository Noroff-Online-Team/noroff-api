import { FastifyInstance } from "fastify"
import { createResponseSchema } from "@noroff/api-utils"

import {
  createVenueHandler,
  deleteVenueHandler,
  getVenueHandler,
  getVenuesHandler,
  searchVenuesHandler,
  updateVenueHandler
} from "./venues.controller"
import {
  createVenueSchema,
  displayVenueSchema,
  queryFlagsSchema,
  searchQuerySchema,
  updateVenueSchema,
  venueIdSchema,
  venuesQuerySchema
} from "./venues.schema"

async function venuesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["holidaze-venues"],
        querystring: venuesQuerySchema,
        response: {
          200: createResponseSchema(displayVenueSchema.array())
        }
      }
    },
    getVenuesHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["holidaze-venues"],
        params: venueIdSchema,
        querystring: queryFlagsSchema,
        response: {
          200: createResponseSchema(displayVenueSchema)
        }
      }
    },
    getVenueHandler
  )

  server.get(
    "/search",
    {
      schema: {
        tags: ["holidaze-venues"],
        querystring: searchQuerySchema,
        response: {
          200: createResponseSchema(displayVenueSchema.array())
        }
      }
    },
    searchVenuesHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-venues"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        body: createVenueSchema,
        response: {
          201: createResponseSchema(displayVenueSchema)
        }
      }
    },
    createVenueHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-venues"],
        security: [{ bearerAuth: [] }],
        params: venueIdSchema,
        querystring: queryFlagsSchema,
        body: updateVenueSchema,
        response: {
          200: createResponseSchema(displayVenueSchema)
        }
      }
    },
    updateVenueHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-venues"],
        security: [{ bearerAuth: [] }],
        params: venueIdSchema
      }
    },
    deleteVenueHandler
  )
}

export default venuesRoutes
