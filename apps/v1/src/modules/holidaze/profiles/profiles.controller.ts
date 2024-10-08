import { mediaGuard } from "@noroff/api-utils"
import type {
  HolidazeBooking,
  HolidazeProfile,
  HolidazeVenue
} from "@prisma/v1-client"
import type { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import type { HolidazeBookingIncludes } from "../bookings/bookings.controller"
import type { HolidazeVenueIncludes } from "../venues/venues.controller"
import type { ProfileMediaSchema } from "./profiles.schema"
import {
  getProfile,
  getProfileBookings,
  getProfileVenues,
  getProfiles,
  updateProfile,
  updateProfileMedia
} from "./profiles.service"

export interface HolidazeProfileIncludes {
  venues?: boolean
  bookings?: boolean
}

export async function getProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      _venues?: boolean
      _bookings?: boolean
      sort?: keyof HolidazeProfile
      sortOrder?: "asc" | "desc"
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _venues, _bookings } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: HolidazeProfileIncludes = {
    venues: Boolean(_venues),
    bookings: Boolean(_bookings)
  }

  const profiles = await getProfiles(sort, sortOrder, limit, offset, includes)
  return reply.code(200).send(profiles)
}

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      _venues?: boolean
      _bookings?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const { _venues, _bookings } = request.query

  const includes: HolidazeProfileIncludes = {
    venues: Boolean(_venues),
    bookings: Boolean(_bookings)
  }

  const profile = await getProfile(name, includes)

  if (!profile) {
    throw new NotFound("No profile with this name")
  }

  reply.code(200).send(profile)
}

export async function updateProfileMediaHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Body: ProfileMediaSchema
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const { avatar } = request.body
  const { name: reqUser } = request.user as HolidazeProfile

  const profile = await getProfile(name)

  if (!profile) {
    throw new NotFound("No profile with this name")
  }

  if (profile.name.toLowerCase() !== reqUser.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this profile")
  }

  await mediaGuard(avatar)

  const updatedProfile = await updateProfileMedia(name, request.body)
  reply.code(200).send(updatedProfile)
}

export async function updateProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Body: { venueManager: boolean }
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const { venueManager } = request.body
  const { name: reqUser } = request.user as HolidazeProfile

  const profile = await getProfile(name)

  if (!profile) {
    throw new NotFound("No profile with this name")
  }

  if (profile.name.toLowerCase() !== reqUser.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this profile")
  }

  const updatedProfile = await updateProfile(name, venueManager)
  reply.code(200).send(updatedProfile)
}

export async function getProfileVenuesHandler(
  request: FastifyRequest<{
    Params: { name: string }
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
  const { name } = request.params
  const { limit, offset, sort, sortOrder, _owner, _bookings } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const profile = await getProfile(name)

  if (!profile) {
    throw new NotFound("No profile with this name")
  }

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const venues = await getProfileVenues(
    name,
    sort,
    sortOrder,
    limit,
    offset,
    includes
  )
  reply.code(200).send(venues)
}

export async function getProfileBookingsHandler(
  request: FastifyRequest<{
    Params: { name: string }
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
  const { name } = request.params
  const { limit, offset, sort, sortOrder, _customer, _venue } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const profile = await getProfile(name)

  if (!profile) {
    throw new NotFound("No profile with this name")
  }

  const includes: HolidazeBookingIncludes = {
    customer: Boolean(_customer),
    venue: Boolean(_venue)
  }

  const bookings = await getProfileBookings(
    name,
    sort,
    sortOrder,
    limit,
    offset,
    includes
  )
  reply.code(200).send(bookings)
}
