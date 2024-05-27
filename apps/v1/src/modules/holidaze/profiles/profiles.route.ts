import type { FastifyInstance } from "fastify"

import {
  bookingsQuerySchema,
  displayBookingSchema
} from "../bookings/bookings.schema"
import { displayVenueSchema, venuesQuerySchema } from "../venues/venues.schema"
import {
  getProfileBookingsHandler,
  getProfileHandler,
  getProfileVenuesHandler,
  getProfilesHandler,
  updateProfileHandler,
  updateProfileMediaHandler
} from "./profiles.controller"
import {
  displayProfileSchema,
  profileMediaSchema,
  profileNameSchema,
  profileVenueManagerSchema,
  profilesQuerySchema,
  queryFlagsSchema
} from "./profiles.schema"

async function profilesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        response: {
          200: displayProfileSchema.array()
        }
      }
    },
    getProfilesHandler
  )

  server.get(
    "/:name",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: profileNameSchema,
        response: {
          200: displayProfileSchema
        }
      }
    },
    getProfileHandler
  )

  server.put(
    "/:name",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        body: profileVenueManagerSchema,
        response: {
          200: displayProfileSchema
        }
      }
    },
    updateProfileHandler
  )

  server.put(
    "/:name/media",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        body: profileMediaSchema,
        response: {
          200: displayProfileSchema
        }
      }
    },
    updateProfileMediaHandler
  )

  server.get(
    "/:name/venues",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        querystring: venuesQuerySchema,
        response: {
          200: displayVenueSchema.array()
        }
      }
    },
    getProfileVenuesHandler
  )

  server.get(
    "/:name/bookings",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        querystring: bookingsQuerySchema.omit({ _customer: true }),
        response: {
          200: displayBookingSchema.array()
        }
      }
    },
    getProfileBookingsHandler
  )
}

export default profilesRoutes
