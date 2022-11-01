import { AuctionListing, AuctionProfile } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "./../../../utils/mediaGuard"
import { ProfileMediaSchema } from "./profiles.schema"
import { NotFound, BadRequest } from "http-errors"

import { getProfiles, getProfile, updateProfileMedia, getProfileListings } from "./profiles.service"

import { AuctionListingIncludes } from "../listings/listings.controller"

export interface AuctionProfileIncludes {
  listings?: boolean
}

export async function getProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      _listings?: boolean
      sort?: keyof AuctionProfile
      sortOrder?: "asc" | "desc"
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _listings } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: AuctionProfileIncludes = {
    listings: Boolean(_listings)
  }

  const profiles = await getProfiles(sort, sortOrder, limit, offset, includes)
  return reply.code(200).send(profiles)
}

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      _listings?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const { _listings } = request.query

  const includes: AuctionProfileIncludes = {
    listings: Boolean(_listings)
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

  await mediaGuard(avatar)

  const profile = await updateProfileMedia(name, request.body)
  reply.code(200).send(profile)
}

export async function getProfileListingsHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      limit?: number
      offset?: number
      sort?: keyof AuctionListing
      sortOrder?: "asc" | "desc"
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const { sort, sortOrder, limit, offset, _seller, _bids } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const profileExists = await getProfile(name)

  if (!profileExists) {
    throw new NotFound("No profile with this name")
  }

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listings = await getProfileListings(name, sort, sortOrder, limit, offset, includes)
  reply.code(200).send(listings)
}
