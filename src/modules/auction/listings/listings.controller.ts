import { getProfile } from "./../profiles/profiles.service"
import { AuctionBid, AuctionListing, AuctionProfile, Prisma } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "@/utils/mediaGuard"
import { NotFound, BadRequest, Forbidden } from "http-errors"

import { CreateListingSchema, UpdateListingSchema } from "./listings.schema"
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  createListingBid
} from "./listings.service"

export type ListingWithBids = Prisma.PromiseReturnType<typeof getListing> & { bids: Array<AuctionBid> | [] }

export interface AuctionListingIncludes {
  bids?: boolean
  seller?: boolean
}

export async function getListingsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      sort?: keyof AuctionListing
      sortOrder?: "asc" | "desc"
      _seller?: boolean
      _bids?: boolean
      _tag?: string
      _active?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _bids, _seller, _tag, _active } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listings = await getListings(sort, sortOrder, limit, offset, includes, _tag, _active)
  reply.code(200).send(listings)
}

export async function getListingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { _bids, _seller } = request.query

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = await getListing(id, includes)

  if (!listing) {
    throw new NotFound("No listing with such ID")
  }

  reply.code(200).send(listing)
}

export async function createListingHandler(
  request: FastifyRequest<{
    Body: CreateListingSchema
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as AuctionProfile
  const { media } = request.body
  const { _bids, _seller } = request.query

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  if (media) {
    for (const url of media) {
      await mediaGuard(url)
    }
  }

  try {
    const listing = await createListing(request.body, name, includes)
    reply.code(201).send(listing)
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function updateListingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateListingSchema
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as AuctionProfile
  const { media } = request.body
  const { _bids, _seller } = request.query

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = await getListing(id)

  if (!listing) {
    throw new NotFound("No listing with such ID")
  }

  if (listing.sellerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this listing")
  }

  if (media) {
    for (const url of media) {
      await mediaGuard(url)
    }
  }

  try {
    const updatedListing = await updateListing(id, request.body, includes)
    reply.code(200).send(updatedListing)
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function deleteListingHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as AuctionProfile

  const listing = await getListing(id)

  if (!listing) {
    throw new NotFound("No listing with such ID")
  }

  if (listing.sellerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You do not have permission to delete this listing")
  }

  try {
    await deleteListing(id)
    reply.code(204)
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function createListingBidHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: {
      amount: number
    }
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { amount } = request.body
  const { name } = request.user as AuctionProfile
  const { _bids, _seller } = request.query

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = (await getListing(id, { bids: true })) as ListingWithBids

  if (!listing) {
    throw new NotFound("No listing with such ID")
  }

  if (listing.sellerName.toLowerCase() === name.toLowerCase()) {
    throw new Forbidden("You cannot bid on your own listing")
  }

  if (listing.endsAt && new Date(listing.endsAt) < new Date()) {
    throw new BadRequest("This listing has already ended")
  }

  const bidderProfile = (await getProfile(name)) as AuctionProfile
  if (bidderProfile.credits < amount) {
    throw new BadRequest("You do not have enough balance to bid this amount")
  }

  const currentHighestBid = Math.max(...listing.bids.map(bid => bid.amount), 0)
  if (currentHighestBid >= amount) {
    throw new BadRequest("Your bid must be higher than the current bid")
  }

  try {
    await createListingBid(id, name, amount)
    const updatedListing = await getListing(id, includes)
    reply.code(200).send(updatedListing)
  } catch (error) {
    reply.code(500).send(error)
  }
}
