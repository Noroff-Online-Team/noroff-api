import { AuctionListing } from "@prisma/client"
import { prisma } from "../../../utils"
import { AuctionProfileIncludes } from "./listings.controller"

export async function getListings(
  sort: keyof AuctionListing = "title",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: AuctionProfileIncludes = {}
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

export async function getListing(id: number, includes: AuctionProfileIncludes = {}) {
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
