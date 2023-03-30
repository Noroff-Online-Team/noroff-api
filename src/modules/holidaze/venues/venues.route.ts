import { FastifyInstance } from "fastify"

import {
  displayVenueSchema,
  venuesQuerySchema,
  venueIdSchema,
  queryFlagsSchema,
  createVenueSchema
} from "./venues.schema"
import { getVenuesHandler, getVenueHandler, createVenueHandler, deleteVenueHandler } from "./venues.controller"

async function venuesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-venues"],
        security: [{ bearerAuth: [] }],
        querystring: venuesQuerySchema,
        response: {
          200: displayVenueSchema.array()
        }
      }
    },
    getVenuesHandler
  )

  server.get(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-venues"],
        security: [{ bearerAuth: [] }],
        params: venueIdSchema,
        querystring: queryFlagsSchema,
        response: {
          200: displayVenueSchema
        }
      }
    },
    getVenueHandler
  )

  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-venues"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        body: createVenueSchema,
        response: {
          201: displayVenueSchema
        }
      }
    },
    createVenueHandler
  )

  server.delete(
    "/:id",
    {
      preHandler: [server.authenticate],
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
