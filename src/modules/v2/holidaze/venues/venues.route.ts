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
import { createResponseSchema } from "@/utils/createResponseSchema"

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
