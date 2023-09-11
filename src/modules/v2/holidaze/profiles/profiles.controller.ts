import { HolidazeBooking, UserProfile, HolidazeVenue } from "@prisma-api-v2/client"
import { FastifyRequest } from "fastify"
import { mediaGuard } from "@/utils/mediaGuard"
import {
  UpdateProfileSchema,
  profilesQuerySchema,
  profileNameSchema,
  queryFlagsSchema,
  updateProfileSchema
} from "./profiles.schema"
import { NotFound, BadRequest, Forbidden, InternalServerError, isHttpError } from "http-errors"

import { getProfiles, getProfile, getProfileVenues, getProfileBookings, updateProfile } from "./profiles.service"
import { HolidazeBookingIncludes } from "../bookings/bookings.controller"
import { HolidazeVenueIncludes } from "../venues/venues.controller"
import { ZodError } from "zod"

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
  try {
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

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      _venues?: boolean
      _bookings?: boolean
    }
  }>
) {
  try {
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

export async function updateProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Body: UpdateProfileSchema
  }>
) {
  try {
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
  try {
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
  try {
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
