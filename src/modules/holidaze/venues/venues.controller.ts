import { HolidazeProfile, HolidazeVenue } from "@prisma/client"
import { FastifyRequest, FastifyReply } from "fastify"
import { BadRequest, NotFound, Forbidden } from "http-errors"
import { CreateVenueSchema, UpdateVenueSchema } from "./venues.schema"
import { getProfile } from "../profiles/profiles.service"
import { getVenues, getVenue, createVenue, deleteVenue, updateVenue } from "./venues.service"
import { mediaGuard } from "../../../utils/mediaGuard"

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

export async function createVenueHandler(
  request: FastifyRequest<{
    Body: CreateVenueSchema
    Querystring: {
      _owner?: boolean
      _bookings?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as HolidazeProfile
  const { media } = request.body
  const { _owner, _bookings } = request.query

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  if (media) {
    for (const url of media) {
      await mediaGuard(url)
    }
  }

  const profile = await getProfile(name)

  if (!profile) {
    throw new NotFound("Profile not found")
  }

  if (!profile.venueManager) {
    throw new Forbidden("You are not a venue manager")
  }

  const venue = await createVenue(request.body, name, includes)
  reply.code(201).send(venue)
}

export async function updateVenueHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateVenueSchema
    Querystring: {
      _owner?: boolean
      _bookings?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as HolidazeProfile
  const { id } = request.params
  const { media } = request.body
  const { _owner, _bookings } = request.query

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  if (media) {
    for (const url of media) {
      await mediaGuard(url)
    }
  }

  const venue = await getVenue(id)

  if (!venue) {
    throw new NotFound("Venue not found")
  }

  if (venue.ownerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this venue")
  }

  const profile = await getProfile(name)

  if (profile && !profile.venueManager) {
    throw new Forbidden("You are not a venue manager")
  }

  const updatedVenue = await updateVenue(id, request.body, includes)
  reply.code(200).send(updatedVenue)
}

export async function deleteVenueHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as HolidazeProfile
  const { id } = request.params

  const venue = await getVenue(id)

  if (!venue) {
    throw new NotFound("Venue not found")
  }

  if (venue.ownerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this venue")
  }

  const profile = await getProfile(name)

  if (profile && !profile.venueManager) {
    throw new Forbidden("You are not a venue manager")
  }

  await deleteVenue(id)
  reply.code(204)
}
