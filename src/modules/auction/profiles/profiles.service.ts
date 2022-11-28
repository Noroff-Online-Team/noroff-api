import { AuctionBid, AuctionListing, AuctionProfile } from "@prisma/client"
import { prisma } from "../../../utils"
import { AuctionListingIncludes } from "../listings/listings.controller"
import { AuctionProfileIncludes } from "./profiles.controller"
import { ProfileMediaSchema } from "./profiles.schema"

export async function getProfiles(
  sort: keyof AuctionProfile = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: AuctionProfileIncludes = {}
) {
  return await prisma.auctionProfile.findMany({
    include: {
      ...includes,
      _count: {
        select: {
          listings: true
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

export async function getProfile(name: string, includes: AuctionProfileIncludes = {}) {
  return await prisma.auctionProfile.findUnique({
    where: { name },
    include: {
      ...includes,
      _count: {
        select: {
          listings: true
        }
      }
    }
  })
}

export async function updateProfileMedia(name: string, { avatar }: ProfileMediaSchema) {
  return await prisma.auctionProfile.update({
    where: { name },
    data: {
      avatar
    }
  })
}

export async function getProfileListings(
  name: string,
  sort: keyof AuctionListing = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: AuctionListingIncludes = {}
) {
  return await prisma.auctionListing.findMany({
    where: { sellerName: name },
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
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

export async function getProfileCredits(name: string) {
  return await prisma.auctionProfile.findUnique({
    where: { name },
    select: {
      credits: true
    }
  })
}

export async function getProfileBids(
  name: string,
  sort: keyof AuctionBid = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: { listing?: boolean } = {}
) {
  return await prisma.auctionBid.findMany({
    where: { bidderName: name },
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes
    }
  })
}
