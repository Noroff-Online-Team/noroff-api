import type { FastifyReply, FastifyRequest } from "fastify"
import type { HolidazeBooking, HolidazeProfile } from "@prisma/v1-client"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import { getVenue } from "../venues/venues.service"
import {
  createBooking,
  deleteBooking,
  getBooking,
  getBookings,
  updateBooking
} from "./booking.service"
import type { CreateBookingSchema, UpdateBookingSchema } from "./bookings.schema"

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
      _venue?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as HolidazeProfile
  const { _customer, _venue } = request.query

  const includes: HolidazeBookingIncludes = {
    customer: Boolean(_customer),
    venue: Boolean(_venue)
  }

  const venue = await getVenue(request.body.venueId)

  if (!venue) {
    throw new NotFound("No venue with this id")
  }

  if (request.body.guests > venue.maxGuests) {
    throw new BadRequest(
      `This venue only accommodates ${venue.maxGuests}, but you are attempting to book with ${request.body.guests} guests.`
    )
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

export async function updateBookingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateBookingSchema
    Querystring: {
      _customer?: boolean
      _venue?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as HolidazeProfile
  const { _customer, _venue } = request.query

  const includes: HolidazeBookingIncludes = {
    customer: Boolean(_customer),
    venue: Boolean(_venue)
  }

  // See comment in deleteBookingHandler.
  const booking = await getBooking(id, { customer: false })

  if (!booking) {
    throw new NotFound("No booking with such ID")
  }

  if (booking.customerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this booking")
  }

  const updatedBooking = await updateBooking(id, request.body, includes)
  reply.code(200).send(updatedBooking)
}

export async function deleteBookingHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as HolidazeProfile
  const { id } = request.params

  // For some reason, not including a "includes" object here leads to error
  // "The `include` statement for type HolidazeBooking must not be empty."
  // I'm not totally sure why, but it works with this workaround.
  const booking = await getBooking(id, { customer: false })

  if (!booking) {
    throw new NotFound("Booking not found")
  }

  if (booking.customerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this booking")
  }

  await deleteBooking(id)
  reply.code(204)
}
