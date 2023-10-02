import { FastifyReply, FastifyRequest } from "fastify"
import { HolidazeBooking, UserProfile } from "@prisma/v2-client"
import { BadRequest, NotFound, Forbidden, InternalServerError, Conflict, isHttpError } from "http-errors"
import { getBookings, getBooking, createBooking, deleteBooking, updateBooking } from "./booking.service"
import {
  bookingIdSchema,
  bookingsQuerySchema,
  createBookingSchema,
  CreateBookingSchema,
  queryFlagsSchema,
  updateBookingSchema,
  UpdateBookingSchema
} from "./bookings.schema"
import { getVenue } from "../venues/venues.service"
import { ZodError } from "zod"

import { checkForOverlappingBookings } from "./booking.utils"

export interface HolidazeBookingIncludes {
  customer?: boolean
  venue?: boolean
}

export async function getBookingsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof HolidazeBooking
      sortOrder?: "asc" | "desc"
      _customer?: boolean
      _venue?: boolean
    }
  }>
) {
  try {
    await bookingsQuerySchema.parseAsync(request.query)
    const { sort, sortOrder, limit, page, _customer, _venue } = request.query

    if (limit && limit > 100) {
      throw new BadRequest("Limit cannot be greater than 100")
    }

    const includes: HolidazeBookingIncludes = {
      customer: Boolean(_customer),
      venue: Boolean(_venue)
    }

    const bookings = await getBookings(sort, sortOrder, limit, page, includes)

    return bookings
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getBookingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Querystring: {
      _customer?: boolean
      _venue?: boolean
    }
  }>
) {
  try {
    const { id } = await bookingIdSchema.parseAsync(request.params)
    const { _customer, _venue } = await queryFlagsSchema.parseAsync(request.query)

    const includes: HolidazeBookingIncludes = {
      customer: Boolean(_customer),
      venue: Boolean(_venue)
    }

    const booking = await getBooking(id, includes)

    if (!booking.data) {
      throw new NotFound("No booking with this id")
    }

    return booking
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
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
  try {
    await createBookingSchema.parseAsync(request.body)
    const { name } = request.user as UserProfile
    const { _customer, _venue } = await queryFlagsSchema.parseAsync(request.query)

    const includes: HolidazeBookingIncludes = {
      customer: Boolean(_customer),
      venue: Boolean(_venue)
    }

    const venue = await getVenue(request.body.venueId)

    if (!venue.data) {
      throw new NotFound("No venue with this id")
    }

    const hasOverlap = await checkForOverlappingBookings(request.body)

    if (hasOverlap) {
      throw new Conflict(
        "The selected dates and guests either overlap with an existing booking or exceed the maximum guests for this venue."
      )
    }

    if (request.body.guests > venue.data.maxGuests) {
      throw new BadRequest(
        `This venue only accommodates ${venue.data.maxGuests}, but you are attempting to book with ${request.body.guests} guests.`
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
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function updateBookingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateBookingSchema
    Querystring: {
      _customer?: boolean
      _venue?: boolean
    }
  }>
) {
  try {
    const { guests } = await updateBookingSchema.parseAsync(request.body)
    const { name } = request.user as UserProfile
    const { id } = await bookingIdSchema.parseAsync(request.params)
    const { _customer, _venue } = request.query

    const includes: HolidazeBookingIncludes = {
      customer: Boolean(_customer),
      venue: Boolean(_venue)
    }

    const booking = await getBooking(id)

    if (!booking.data) {
      throw new NotFound("No booking with such ID")
    }

    if (booking.data.customerName.toLowerCase() !== name.toLowerCase()) {
      throw new Forbidden("You are not the owner of this booking")
    }

    const venue = await getVenue(booking.data.venueId)

    if (guests && guests > venue.data.maxGuests) {
      throw new BadRequest(
        `This venue only accommodates ${venue.data.maxGuests}, but you are attempting to book with ${request.body.guests} guests.`
      )
    }

    const updatedBooking = await updateBooking(id, request.body, includes)

    return updatedBooking
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function deleteBookingHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  try {
    const { name } = request.user as UserProfile
    const { id } = await bookingIdSchema.parseAsync(request.params)

    const booking = await getBooking(id)

    if (!booking.data) {
      throw new NotFound("Booking not found")
    }

    if (booking.data.customerName.toLowerCase() !== name.toLowerCase()) {
      throw new Forbidden("You are not the owner of this booking")
    }

    await deleteBooking(id)

    reply.code(204)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
