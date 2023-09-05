import { AuctionBid, AuctionListing, UserProfile } from "@prisma-api-v2/client"
import { FastifyRequest } from "fastify"
import { mediaGuard } from "@/utils/mediaGuard"
import {
  updateProfileSchema,
  UpdateProfileSchema,
  profileNameSchema,
  profilesQuerySchema,
  queryFlagsSchema
} from "./profiles.schema"
import { NotFound, BadRequest, Forbidden, InternalServerError, isHttpError } from "http-errors"

import { getProfiles, getProfile, updateProfile, getProfileListings, getProfileBids } from "./profiles.service"

import { AuctionListingIncludes } from "../listings/listings.controller"
import { ZodError } from "zod"
import { listingQuerySchema } from "../listings/listings.schema"

export interface AuctionProfileIncludes {
  listings?: boolean
}

export async function getProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      _listings?: boolean
      sort?: keyof UserProfile
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  try {
    const { sort, sortOrder, limit, page, _listings } = request.query

    if (limit && limit > 100) {
      throw new BadRequest("Limit cannot be greater than 100")
    }

    const includes: AuctionProfileIncludes = {
      listings: Boolean(_listings)
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
      _listings?: boolean
    }
  }>
) {
  try {
    const { name } = await profileNameSchema.parseAsync(request.params)
    const { _listings } = await queryFlagsSchema.parseAsync(request.query)

    const includes: AuctionProfileIncludes = {
      listings: Boolean(_listings)
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
    const { avatar, banner } = await updateProfileSchema.parseAsync(request.body)
    const { name: profileToUpdate } = await profileNameSchema.parseAsync(request.params)
    const { name: requesterProfile } = request.user as UserProfile

    const profileExists = await getProfile(profileToUpdate)

    if (!profileExists.data) {
      throw new NotFound("No profile with this name")
    }

    if (requesterProfile.toLowerCase() !== profileToUpdate.toLowerCase()) {
      throw new Forbidden("You do not have permission to update this profile")
    }

    if (avatar?.url) {
      await mediaGuard(avatar.url)
    }
    if (banner?.url) {
      await mediaGuard(banner.url)
    }

    const profile = await updateProfile(profileToUpdate, { avatar, banner })

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

export async function getProfileListingsHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof AuctionListing
      sortOrder?: "asc" | "desc"
      _seller?: boolean
      _bids?: boolean
      _tag?: string
      _active?: boolean
    }
  }>
) {
  try {
    const { name } = await profileNameSchema.parseAsync(request.params)
    await listingQuerySchema.parseAsync(request.query)
    const { sort, sortOrder, limit, page, _seller, _bids, _tag, _active } = request.query

    if (limit && limit > 100) {
      throw new BadRequest("Limit cannot be greater than 100")
    }

    const profileExists = await getProfile(name)

    if (!profileExists.data) {
      throw new NotFound("No profile with this name")
    }

    const includes: AuctionListingIncludes = {
      bids: Boolean(_bids),
      seller: Boolean(_seller)
    }

    const listings = await getProfileListings(name, sort, sortOrder, limit, page, includes, _tag, _active)

    return listings
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

export async function getProfileCreditsHandler(
  request: FastifyRequest<{
    Params: { name: string }
  }>
) {
  try {
    const { name } = await profileNameSchema.parseAsync(request.params)
    const { name: reqName } = request.user as UserProfile

    const profile = await getProfile(name)

    if (!profile.data) {
      throw new NotFound("No profile with this name")
    }

    if (reqName.toLowerCase() !== name.toLowerCase()) {
      throw new Forbidden("You do not have permission to view another user's credits")
    }

    return {
      data: {
        credits: profile.data.credits
      }
    }
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

export async function getProfileBidsHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof AuctionBid
      sortOrder?: "asc" | "desc"
      _listings?: boolean
    }
  }>
) {
  try {
    const { name } = await profileNameSchema.parseAsync(request.params)
    await profilesQuerySchema.parseAsync(request.query)
    const { sort, sortOrder, limit, page, _listings } = request.query

    if (limit && limit > 100) {
      throw new BadRequest("Limit cannot be greater than 100")
    }

    const profileExists = await getProfile(name)

    if (!profileExists.data) {
      throw new NotFound("No profile with this name")
    }

    const includes = {
      listing: Boolean(_listings)
    }

    const bids = await getProfileBids(name, sort, sortOrder, limit, page, includes)

    return bids
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
