import type { FastifyInstance } from "fastify"

import {
  createBookingHandler,
  deleteBookingHandler,
  getBookingHandler,
  getBookingsHandler,
  updateBookingHandler
} from "./bookings.controller"
import {
  bookingIdSchema,
  bookingsQuerySchema,
  createBookingSchema,
  displayBookingSchema,
  queryFlagsSchema,
  updateBookingSchema
} from "./bookings.schema"

async function bookingsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        querystring: bookingsQuerySchema,
        response: {
          200: displayBookingSchema.array()
        }
      }
    },
    getBookingsHandler
  )

  server.get(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: bookingIdSchema,
        response: {
          200: displayBookingSchema
        }
      }
    },
    getBookingHandler
  )

  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        body: createBookingSchema.omit({ customerName: true }),
        response: {
          201: displayBookingSchema
        }
      }
    },
    createBookingHandler
  )

  server.put(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["holidaze-bookings"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: bookingIdSchema,
        body: updateBookingSchema,
        response: {
          200: displayBookingSchema
        }
      }
    },
    updateBookingHandler
  )

  server.delete(
    "/:id",
    {
      preHandler: [server.authenticate],
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
