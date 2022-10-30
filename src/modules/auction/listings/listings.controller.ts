import { AuctionListing } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { NotFound, BadRequest } from "http-errors"

import { getListings, getListing } from "./listings.service"

export interface AuctionProfileIncludes {
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
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _bids, _seller } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: AuctionProfileIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listings = await getListings(sort, sortOrder, limit, offset, includes)
  return reply.code(200).send(listings)
}

export async function getListingHandler(
  request: FastifyRequest<{
    Params: { id: number }
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { _bids, _seller } = request.query

  const includes: AuctionProfileIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = await getListing(id, includes)

  if (!listing) {
    throw new NotFound("No listing with such ID")
  }

  return reply.code(200).send(listing)
}
