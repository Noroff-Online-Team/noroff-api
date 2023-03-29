import { FastifyReply, FastifyRequest } from "fastify"
import { HolidazeBooking } from "@prisma/client"
import { BadRequest } from "http-errors"
import { getBookings } from "./booking.service"

export interface HolidazeBookingIncludes {
  customer?: boolean
  venue?: boolean
}

export async function getBookingsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      sort?: keyof HolidazeBooking
      sortOrder?: "asc" | "desc"
      _customer?: boolean
      _venue?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _customer, _venue } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: HolidazeBookingIncludes = {
    customer: Boolean(_customer),
    venue: Boolean(_venue)
  }

  const bookings = await getBookings(sort, sortOrder, limit, offset, includes)
  reply.code(200).send(bookings)
}
