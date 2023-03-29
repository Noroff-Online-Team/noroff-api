import { FastifyReply, FastifyRequest } from "fastify"
import { HolidazeBooking, HolidazeProfile } from "@prisma/client"
import { BadRequest, NotFound } from "http-errors"
import { getBookings, getBooking, createBooking } from "./booking.service"
import { CreateBookingSchema } from "./bookings.schema"
import { getVenue } from "../venues/venues.service"

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

export async function getBookingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Querystring: {
      _customer?: boolean
      _venue?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { _customer, _venue } = request.query

  const includes: HolidazeBookingIncludes = {
    customer: Boolean(_customer),
    venue: Boolean(_venue)
  }

  const booking = await getBooking(id, includes)

  if (!booking) {
    throw new NotFound("No booking with this id")
  }

  reply.code(200).send(booking)
}

export async function createBookingHandler(
  request: FastifyRequest<{
    Body: CreateBookingSchema
    Querystring: {
      _customer?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as HolidazeProfile
  const { _customer } = request.query

  const includes: HolidazeBookingIncludes = {
    customer: Boolean(_customer)
  }

  const venue = await getVenue(request.body.venueId)

  if (!venue) {
    throw new NotFound("No venue with this id")
  }

  const booking = await createBooking(
    {
      ...request.body,
      customerName: name
    },
    includes
  )
  reply.code(201).send(booking)
}
