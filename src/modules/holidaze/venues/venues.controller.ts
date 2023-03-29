import { HolidazeVenue } from "@prisma/client"
import { FastifyRequest, FastifyReply } from "fastify"
import { BadRequest, NotFound } from "http-errors"
import { getVenues, getVenue } from "./venues.service"

export interface HolidazeVenueIncludes {
  owner?: boolean
  bookings?: boolean
}

export async function getVenuesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      sort?: keyof HolidazeVenue
      sortOrder?: "asc" | "desc"
      _owner?: boolean
      _bookings?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _owner, _bookings } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const venues = await getVenues(sort, sortOrder, limit, offset, includes)
  reply.code(200).send(venues)
}

export async function getVenueHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Querystring: {
      _owner?: boolean
      _bookings?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { _owner, _bookings } = request.query

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const venue = await getVenue(id, includes)

  if (!venue) {
    throw new NotFound("Venue not found")
  }

  reply.code(200).send(venue)
}
