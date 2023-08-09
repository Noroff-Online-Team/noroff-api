import { FastifyInstance } from "fastify"

import {
  displayProfileSchema,
  profilesQuerySchema,
  profileNameSchema,
  queryFlagsSchema,
  updateProfileSchema
} from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  updateProfileHandler,
  getProfileVenuesHandler,
  getProfileBookingsHandler
} from "./profiles.controller"
import { createResponseSchema } from "@/utils/createResponseSchema"

import { displayVenueSchema, venuesQuerySchema } from "../venues/venues.schema"
import { displayBookingSchema, bookingsQuerySchema } from "../bookings/bookings.schema"

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
          200: createResponseSchema(displayProfileSchema.array())
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
          200: createResponseSchema(displayProfileSchema)
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
        body: updateProfileSchema,
        response: {
          200: createResponseSchema(displayProfileSchema)
        }
      }
    },
    updateProfileHandler
  )

  // server.put(
  //   "/:name/media",
  //   {
  //     preHandler: [server.authenticate],
  //     schema: {
  //       tags: ["holidaze-profiles"],
  //       security: [{ bearerAuth: [] }],
  //       params: profileNameSchema,
  //       body: updateProfileSchema,
  //       response: {
  //         200: createResponseSchema(displayProfileSchema)
  //       }
  //     }
  //   },
  //   updateProfileMediaHandler
  // )

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
          200: createResponseSchema(displayVenueSchema.array())
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
          200: createResponseSchema(displayBookingSchema.array())
        }
      }
    },
    getProfileBookingsHandler
  )
}

export default profilesRoutes
