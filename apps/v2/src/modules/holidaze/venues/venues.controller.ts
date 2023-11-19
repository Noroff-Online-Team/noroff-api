import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "@noroff/api-utils"
import { HolidazeVenue, UserProfile } from "@prisma/v2-client"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import { getProfile } from "../profiles/profiles.service"
import {
  createVenueSchema,
  CreateVenueSchema,
  queryFlagsSchema,
  searchQuerySchema,
  updateVenueSchema,
  UpdateVenueSchema,
  venueIdSchema,
  venuesQuerySchema
} from "./venues.schema"
import { createVenue, deleteVenue, getVenue, getVenues, searchVenues, updateVenue } from "./venues.service"

export interface HolidazeVenueIncludes {
  owner?: boolean
  bookings?: boolean
}

export async function getVenuesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof HolidazeVenue
      sortOrder?: "asc" | "desc"
      _owner?: boolean
      _bookings?: boolean
    }
  }>
) {
  await venuesQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _owner, _bookings } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const venues = await getVenues(sort, sortOrder, limit, page, includes)

  return venues
}

export async function getVenueHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Querystring: {
      _owner?: boolean
      _bookings?: boolean
    }
  }>
) {
  const { id } = await venueIdSchema.parseAsync(request.params)
  const { _owner, _bookings } = await queryFlagsSchema.parseAsync(request.query)

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const venue = await getVenue(id, includes)

  if (!venue.data) {
    throw new NotFound("Venue not found")
  }

  return venue
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
  const { name } = request.user as UserProfile
  const { media } = await createVenueSchema.parseAsync(request.body)
  const { _owner, _bookings } = await queryFlagsSchema.parseAsync(request.query)

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const profile = await getProfile(name)

  if (!profile.data) {
    throw new NotFound("Profile not found")
  }

  if (!profile.data.venueManager) {
    throw new Forbidden("You are not a venue manager")
  }

  if (media) {
    for (const image of media) {
      await mediaGuard(image.url)
    }
  }

  const venue = await createVenue(name, request.body, includes)

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
  }>
) {
  const { name } = request.user as UserProfile
  const { id } = await venueIdSchema.parseAsync(request.params)
  const { media } = await updateVenueSchema.parseAsync(request.body)
  const { _owner, _bookings } = await queryFlagsSchema.parseAsync(request.query)

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const venue = await getVenue(id)

  if (!venue.data) {
    throw new NotFound("Venue not found")
  }

  if (venue.data.ownerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this venue")
  }

  const profile = await getProfile(name)

  if (!profile?.data?.venueManager) {
    throw new Forbidden("You are not a venue manager")
  }

  if (media) {
    for (const image of media) {
      await mediaGuard(image.url)
    }
  }

  const updatedVenue = await updateVenue(id, request.body, includes)

  return updatedVenue
}

export async function deleteVenueHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as UserProfile
  const { id } = await venueIdSchema.parseAsync(request.params)

  const venue = await getVenue(id)

  if (!venue.data) {
    throw new NotFound("Venue not found")
  }

  if (venue.data.ownerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this venue")
  }

  const profile = await getProfile(name)

  if (!profile?.data?.venueManager) {
    throw new Forbidden("You are not a venue manager")
  }

  await deleteVenue(id)

  reply.code(204)
}

export async function searchVenuesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof HolidazeVenue
      sortOrder?: "asc" | "desc"
      _owner?: boolean
      _bookings?: boolean
      q: string
    }
  }>
) {
  await searchQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _owner, _bookings, q } = request.query

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const results = await searchVenues(sort, sortOrder, limit, page, q, includes)

  return results
}
