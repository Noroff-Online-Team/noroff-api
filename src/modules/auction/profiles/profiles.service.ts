import { AuctionListing, AuctionProfile } from "@prisma/client"
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

export const getProfile = async (name: string, includes: AuctionProfileIncludes = {}) => {
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

export const updateProfileMedia = async (name: string, { avatar }: ProfileMediaSchema) => {
  return await prisma.auctionProfile.update({
    where: { name },
    data: {
      avatar
    }
  })
}

export const getProfileListings = async (
  name: string,
  sort: keyof AuctionListing = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: AuctionListingIncludes = {}
) => {
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
