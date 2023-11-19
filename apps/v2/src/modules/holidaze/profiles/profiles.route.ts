import { FastifyInstance } from "fastify"
import { createResponseSchema } from "@noroff/api-utils"

import { bookingsQuerySchema, displayBookingSchema } from "../bookings/bookings.schema"
import { displayVenueSchema, venuesQuerySchema } from "../venues/venues.schema"
import {
  getProfileBookingsHandler,
  getProfileHandler,
  getProfilesHandler,
  getProfileVenuesHandler,
  searchProfilesHandler,
  updateProfileHandler
} from "./profiles.controller"
import {
  displayProfileSchema,
  profileNameSchema,
  profilesQuerySchema,
  queryFlagsSchema,
  searchQuerySchema,
  updateProfileSchema
} from "./profiles.schema"

async function profilesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        response: {
          200: createResponseSchema(displayProfileSchema.array())
        }
      }
    },
    getProfilesHandler
  )

  server.get(
    "/:name",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: profileNameSchema,
        response: {
          200: createResponseSchema(displayProfileSchema)
        }
      }
    },
    getProfileHandler
  )

  server.get(
    "/search",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-profiles"],
        querystring: searchQuerySchema,
        response: {
          200: createResponseSchema(displayProfileSchema.array())
        }
      }
    },
    searchProfilesHandler
  )

  server.put(
    "/:name",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        body: updateProfileSchema,
        response: {
          200: createResponseSchema(displayProfileSchema)
        }
      }
    },
    updateProfileHandler
  )

  server.get(
    "/:name/venues",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        querystring: venuesQuerySchema,
        response: {
          200: createResponseSchema(displayVenueSchema.array())
        }
      }
    },
    getProfileVenuesHandler
  )

  server.get(
    "/:name/bookings",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        querystring: bookingsQuerySchema,
        response: {
          200: createResponseSchema(displayBookingSchema.array())
        }
      }
    },
    getProfileBookingsHandler
  )
}

export default profilesRoutes
