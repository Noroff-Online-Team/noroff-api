import { FastifyInstance } from "fastify"

import {
  displayBookingSchema,
  bookingsQuerySchema,
  queryFlagsSchema,
  bookingIdSchema,
  createBookingSchema,
  updateBookingSchema
} from "./bookings.schema"
import {
  getBookingsHandler,
  getBookingHandler,
  createBookingHandler,
  deleteBookingHandler,
  updateBookingHandler
} from "./bookings.controller"
import { createResponseSchema } from "@/utils/createResponseSchema"

async function bookingsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        querystring: bookingsQuerySchema,
        response: {
          200: createResponseSchema(displayBookingSchema.array())
        }
      }
    },
    getBookingsHandler
  )

  server.get(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: bookingIdSchema,
        response: {
          200: createResponseSchema(displayBookingSchema)
        }
      }
    },
    getBookingHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        body: createBookingSchema,
        response: {
          201: createResponseSchema(displayBookingSchema)
        }
      }
    },
    createBookingHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: bookingIdSchema,
        body: updateBookingSchema,
        response: {
          200: createResponseSchema(displayBookingSchema)
        }
      }
    },
    updateBookingHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        params: bookingIdSchema
      }
    },
    deleteBookingHandler
  )
}

export default bookingsRoutes
