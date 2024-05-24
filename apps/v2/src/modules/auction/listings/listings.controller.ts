import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "@noroff/api-utils"
import { AuctionBid, AuctionListing, Prisma, UserProfile } from "@prisma/v2-client"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import { getProfile } from "./../profiles/profiles.service"
import {
  bidBodySchema,
  CreateListingSchema,
  listingIdParamsSchema,
  listingQuerySchema,
  mediaSchema,
  queryFlagsSchema,
  searchQuerySchema,
  UpdateListingSchema
} from "./listings.schema"
import {
  createListing,
  createListingBid,
  deleteListing,
  getListing,
  getListings,
  searchListings,
  updateListing
} from "./listings.service"

export type ListingWithBids = Prisma.PromiseReturnType<typeof getListing> & {
  data: {
    bids: Array<AuctionBid> | []
  }
}

export interface AuctionListingIncludes {
  bids?: boolean
  seller?: boolean
}

export async function getListingsHandler(
  request: FastifyRequest<{
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
  await listingQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _bids, _seller, _tag, _active } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listings = await getListings(sort, sortOrder, limit, page, includes, _tag, _active)

  return listings
}

export async function getListingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>
) {
  const { id } = await listingIdParamsSchema.parseAsync(request.params)
  const { _bids, _seller } = await queryFlagsSchema.parseAsync(request.query)

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = await getListing(id, includes)

  if (!listing.data) {
    throw new NotFound("No listing with such ID")
  }

  return listing
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
  const { name } = request.user as UserProfile
  const { media } = await mediaSchema.parseAsync(request.body)
  const { _bids, _seller } = await queryFlagsSchema.parseAsync(request.query)

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  if (media) {
    for (const image of media) {
      await mediaGuard(image.url)
    }
  }

  const listing = await createListing(request.body, name, includes)

  reply.code(201).send(listing)
}

export async function updateListingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateListingSchema
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>
) {
  const { id } = await listingIdParamsSchema.parseAsync(request.params)
  const { _bids, _seller } = await queryFlagsSchema.parseAsync(request.query)
  const { media } = await mediaSchema.parseAsync(request.body)
  const { name } = request.user as UserProfile

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = await getListing(id)

  if (!listing.data) {
    throw new NotFound("No listing with such ID")
  }

  if (listing.data.sellerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this listing")
  }

  if (media) {
    for (const image of media) {
      await mediaGuard(image.url)
    }
  }

  const updatedListing = await updateListing(id, request.body, includes)

  return updatedListing
}

export async function deleteListingHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { id } = await listingIdParamsSchema.parseAsync(request.params)
  const { name } = request.user as UserProfile

  const listing = await getListing(id)

  if (!listing.data) {
    throw new NotFound("No listing with such ID")
  }

  if (listing.data.sellerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You do not have permission to delete this listing")
  }

  await deleteListing(id)

  reply.code(204)
}

export async function createListingBidHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: { amount: number }
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = await listingIdParamsSchema.parseAsync(request.params)
  const { amount } = await bidBodySchema.parseAsync(request.body)
  const { name } = request.user as UserProfile
  const { _bids, _seller } = await queryFlagsSchema.parseAsync(request.query)

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = (await getListing(id, { bids: true })) as ListingWithBids

  if (!listing.data) {
    throw new NotFound("No listing with such ID")
  }

  if (listing.data.sellerName.toLowerCase() === name.toLowerCase()) {
    throw new Forbidden("You cannot bid on your own listing")
  }

  if (listing.data.endsAt && new Date(listing.data.endsAt) < new Date()) {
    throw new BadRequest("This listing has already ended")
  }

  const bidderProfile = (await getProfile(name)).data as UserProfile
  if (bidderProfile.credits < amount) {
    throw new BadRequest("You do not have enough balance to bid this amount")
  }

  const currentHighestBid = Math.max(...listing.data.bids.map(bid => bid.amount), 0)
  if (currentHighestBid >= amount) {
    throw new BadRequest("Your bid must be higher than the current bid")
  }

  await createListingBid(id, name, amount)

  const updatedListing = await getListing(id, includes)

  reply.code(201).send(updatedListing)
}

export async function searchListingsHandler(
  request: FastifyRequest<{
    Querystring: {
      sort?: keyof AuctionListing
      sortOrder?: "asc" | "desc"
      limit?: number
      page?: number
      _seller?: boolean
      _bids?: boolean
      q: string
    }
  }>
) {
  await searchQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _seller, _bids, q } = request.query

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const results = await searchListings(sort, sortOrder, limit, page, q, includes)

  return results
}
