import { AuctionListing } from "@prisma/client"
import { prisma } from "../../../utils"
import { AuctionListingIncludes } from "./listings.controller"
import { CreateListingSchema, UpdateListingSchema } from "./listings.schema"

export async function getListings(
  sort: keyof AuctionListing = "title",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: AuctionListingIncludes = {}
) {
  return await prisma.auctionListing.findMany({
    include: {
      ...includes,
      _count: {
        select: {
          bids: true
        }
      }
    },
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset
  })
}

export async function getListing(id: string, includes: AuctionListingIncludes = {}) {
  return await prisma.auctionListing.findUnique({
    where: { id },
    include: {
      ...includes,
      _count: {
        select: {
          bids: true
        }
      }
    }
  })
}

export async function createListing(data: CreateListingSchema, seller: string, includes: AuctionListingIncludes = {}) {
  return await prisma.auctionListing.create({
    data: {
      ...data,
      sellerName: seller,
      media: data.media || [],
      created: new Date(),
      updated: new Date()
    },
    include: {
      ...includes,
      _count: {
        select: {
          bids: true
        }
      }
    }
  })
}

export async function updateListing(id: string, data: UpdateListingSchema, includes: AuctionListingIncludes = {}) {
  return await prisma.auctionListing.update({
    where: { id },
    data: {
      ...data,
      media: data.media || [],
      updated: new Date()
    },
    include: {
      ...includes,
      _count: {
        select: {
          bids: true
        }
      }
    }
  })
}

export async function deleteListing(id: string) {
  return await prisma.auctionListing.delete({
    where: { id }
  })
}
