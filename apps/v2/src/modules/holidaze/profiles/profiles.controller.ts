import { FastifyRequest } from "fastify"
import { mediaGuard } from "@noroff/api-utils"
import { HolidazeBooking, HolidazeVenue, UserProfile } from "@prisma/v2-client"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import { HolidazeBookingIncludes } from "../bookings/bookings.controller"
import { HolidazeVenueIncludes } from "../venues/venues.controller"
import {
  profileNameSchema,
  profilesQuerySchema,
  queryFlagsSchema,
  searchQuerySchema,
  UpdateProfileSchema,
  updateProfileSchema
} from "./profiles.schema"
import {
  getProfile,
  getProfileBookings,
  getProfiles,
  getProfileVenues,
  searchProfiles,
  updateProfile
} from "./profiles.service"

export interface HolidazeProfileIncludes {
  venues?: boolean
  bookings?: boolean
}

export async function getProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      _venues?: boolean
      _bookings?: boolean
      sort?: keyof UserProfile
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await profilesQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _venues, _bookings } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: HolidazeProfileIncludes = {
    venues: Boolean(_venues),
    bookings: Boolean(_bookings)
  }

  const profiles = await getProfiles(sort, sortOrder, limit, page, includes)

  return profiles
}

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      _venues?: boolean
      _bookings?: boolean
    }
  }>
) {
  const { name } = await profileNameSchema.parseAsync(request.params)
  const { _venues, _bookings } = await queryFlagsSchema.parseAsync(request.query)

  const includes: HolidazeProfileIncludes = {
    venues: Boolean(_venues),
    bookings: Boolean(_bookings)
  }

  const profile = await getProfile(name, includes)

  if (!profile.data) {
    throw new NotFound("No profile with this name")
  }

  return profile
}

export async function updateProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Body: UpdateProfileSchema
  }>
) {
  const { venueManager, banner, avatar } = await updateProfileSchema.parseAsync(request.body)
  const { name: profileToUpdate } = await profileNameSchema.parseAsync(request.params)
  const { name: requesterProfile } = request.user as UserProfile

  const profile = await getProfile(profileToUpdate)

  if (!profile.data) {
    throw new NotFound("No profile with this name")
  }

  if (profileToUpdate.toLowerCase() !== requesterProfile.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this profile")
  }

  if (avatar?.url) {
    await mediaGuard(avatar.url)
  }
  if (banner?.url) {
    await mediaGuard(banner.url)
  }

  const updatedProfile = await updateProfile(profileToUpdate, { venueManager, banner, avatar })

  return updatedProfile
}

export async function getProfileVenuesHandler(
  request: FastifyRequest<{
    Params: { name: string }
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
  const { name } = await profileNameSchema.parseAsync(request.params)
  const { limit, page, sort, sortOrder, _owner, _bookings } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const profile = await getProfile(name)

  if (!profile.data) {
    throw new NotFound("No profile with this name")
  }

  const includes: HolidazeVenueIncludes = {
    owner: Boolean(_owner),
    bookings: Boolean(_bookings)
  }

  const venues = await getProfileVenues(name, sort, sortOrder, limit, page, includes)

  return venues
}

export async function getProfileBookingsHandler(
  request: FastifyRequest<{
    Params: { name: string }
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
  const { name } = await profileNameSchema.parseAsync(request.params)
  const { limit, page, sort, sortOrder, _customer, _venue } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const profile = await getProfile(name)

  if (!profile.data) {
    throw new NotFound("No profile with this name")
  }

  const includes: HolidazeBookingIncludes = {
    customer: Boolean(_customer),
    venue: Boolean(_venue)
  }

  const bookings = await getProfileBookings(name, sort, sortOrder, limit, page, includes)

  return bookings
}

export async function searchProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      sort?: keyof UserProfile
      sortOrder?: "asc" | "desc"
      limit?: number
      page?: number
      _venues?: boolean
      _bookings?: boolean
      q: string
    }
  }>
) {
  await searchQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _venues, _bookings, q } = request.query

  const includes: HolidazeProfileIncludes = {
    venues: Boolean(_venues),
    bookings: Boolean(_bookings)
  }

  const results = await searchProfiles(sort, sortOrder, limit, page, q, includes)

  return results
}
