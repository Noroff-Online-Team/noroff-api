import { FastifyInstance } from "fastify"

import {
  displayVenueSchema,
  venuesQuerySchema,
  venueIdSchema,
  queryFlagsSchema,
  createVenueSchema,
  updateVenueSchema
} from "./venues.schema"
import {
  getVenuesHandler,
  getVenueHandler,
  createVenueHandler,
  deleteVenueHandler,
  updateVenueHandler
} from "./venues.controller"

async function venuesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["holidaze-venues"],
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
      schema: {
        tags: ["holidaze-venues"],
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

  server.put(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-venues"],
        security: [{ bearerAuth: [] }],
        params: venueIdSchema,
        querystring: queryFlagsSchema,
        body: updateVenueSchema,
        response: {
          200: displayVenueSchema
        }
      }
    },
    updateVenueHandler
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
