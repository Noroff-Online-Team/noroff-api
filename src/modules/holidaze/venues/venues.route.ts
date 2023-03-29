import { FastifyInstance } from "fastify"

import { displayVenueSchema, venuesQuerySchema, venueIdSchema, queryFlagsSchema } from "./venues.schema"
import { getVenuesHandler, getVenueHandler } from "./venues.controller"

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
}

export default venuesRoutes
