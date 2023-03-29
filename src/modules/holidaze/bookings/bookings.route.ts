import { FastifyInstance } from "fastify"

import { displayBookingSchema, bookingsQuerySchema } from "../bookings/bookings.schema"
import { getBookingsHandler } from "./bookings.controller"

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
}

export default bookingsRoutes
