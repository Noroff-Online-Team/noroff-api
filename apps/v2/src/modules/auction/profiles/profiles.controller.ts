import { FastifyRequest } from "fastify"
import { mediaGuard } from "@noroff/api-utils"
import { AuctionBid, AuctionListing, UserProfile } from "@prisma/v2-client"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import { AuctionListingIncludes } from "../listings/listings.controller"
import { listingQuerySchema } from "../listings/listings.schema"
import {
  profileNameSchema,
  profilesQuerySchema,
  queryFlagsSchema,
  searchQuerySchema,
  updateProfileSchema,
  UpdateProfileSchema
} from "./profiles.schema"
import {
  getProfile,
  getProfileBids,
  getProfileListings,
  getProfiles,
  getProfileWins,
  searchProfiles,
  updateProfile
} from "./profiles.service"

export interface AuctionProfileIncludes {
  listings?: boolean
  wins?: boolean
}

export async function getProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof UserProfile
      sortOrder?: "asc" | "desc"
      _listings?: boolean
      _wins?: boolean
    }
  }>
) {
  const { sort, sortOrder, limit, page, _listings, _wins } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: AuctionProfileIncludes = {
    listings: Boolean(_listings),
    wins: Boolean(_wins)
  }

  const profiles = await getProfiles(sort, sortOrder, limit, page, includes)

  return profiles
}

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      _listings?: boolean
      _wins?: boolean
    }
  }>
) {
  const { name } = await profileNameSchema.parseAsync(request.params)
  const { _listings, _wins } = await queryFlagsSchema.parseAsync(request.query)

  const includes: AuctionProfileIncludes = {
    listings: Boolean(_listings),
    wins: Boolean(_wins)
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
}

export async function getProfileCreditsHandler(
  request: FastifyRequest<{
    Params: { name: string }
  }>
) {
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
}

export async function getProfileWinsHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof AuctionListing
      sortOrder?: "asc" | "desc"
      _seller?: boolean
      _bids?: boolean
    }
  }>
) {
  const { name } = await profileNameSchema.parseAsync(request.params)
  await listingQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _seller, _bids } = request.query

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

  const listings = await getProfileWins(name, sort, sortOrder, limit, page, includes)

  return listings
}

export async function searchProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      sort?: keyof UserProfile
      sortOrder?: "asc" | "desc"
      limit?: number
      page?: number
      _listings?: boolean
      _wins?: boolean
      q: string
    }
  }>
) {
  await searchQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _listings, _wins, q } = request.query

  const includes: AuctionProfileIncludes = {
    listings: Boolean(_listings),
    wins: Boolean(_wins)
  }

  const results = await searchProfiles(sort, sortOrder, limit, page, q, includes)

  return results
}
