import { AuctionBid, AuctionListing, UserProfile } from "@prisma-api-v2/client"
import { db } from "@/utils"
import { AuctionListingIncludes } from "../listings/listings.controller"
import { AuctionProfileIncludes } from "./profiles.controller"
import { UpdateProfileSchema } from "./profiles.schema"

export async function getProfiles(
  sort: keyof UserProfile = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: AuctionProfileIncludes = {}
) {
  const includeListings = includes.listings ? { listings: { include: { media: true } } } : {}

  const [data, meta] = await db.userProfile
    .paginate({
      include: {
        ...includes,
        ...includeListings,
        avatar: true,
        banner: true,
        _count: {
          select: {
            listings: true
          }
        }
      },
      orderBy: {
        [sort]: sortOrder
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getProfile(name: string, includes: AuctionProfileIncludes = {}) {
  const includeListings = includes.listings ? { listings: { include: { media: true } } } : {}

  const [data, meta] = await db.userProfile
    .paginate({
      where: { name },
      include: {
        ...includes,
        ...includeListings,
        avatar: true,
        banner: true,
        _count: {
          select: {
            listings: true
          }
        }
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export const updateProfile = async (name: string, { avatar, banner }: UpdateProfileSchema) => {
  const data = await db.userProfile.update({
    where: { name },
    data: {
      avatar: avatar ? { delete: {}, create: avatar } : undefined,
      banner: banner ? { delete: {}, create: banner } : undefined
    },
    include: { avatar: true, banner: true }
  })

  return { data }
}

export async function getProfileListings(
  name: string,
  sort: keyof AuctionListing = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: AuctionListingIncludes = {},
  tag: string | undefined,
  active: boolean | undefined
) {
  const whereTag = tag ? { tags: { has: tag } } : {}
  const whereActive = active ? { endsAt: { gte: new Date() } } : {}
  const withProfileMedia = includes.seller ? { seller: { include: { avatar: true, banner: true } } } : {}

  const [data, meta] = await db.auctionListing
    .paginate({
      where: {
        sellerName: name,
        ...whereTag,
        ...whereActive
      },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...withProfileMedia,
        media: true,
        _count: {
          select: {
            bids: true
          }
        }
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getProfileCredits(name: string) {
  const [data, meta] = await db.userProfile
    .paginate({
      where: { name },
      select: { credits: true }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function getProfileBids(
  name: string,
  sort: keyof AuctionBid = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: { listing?: boolean } = {}
) {
  const [data, meta] = await db.auctionBid
    .paginate({
      where: { bidderName: name },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function searchProfiles(
  sort: keyof UserProfile = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  query: string,
  includes: AuctionProfileIncludes = {}
) {
  const [data, meta] = await db.userProfile
    .paginate({
      where: {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { bio: { contains: query, mode: "insensitive" } }]
      },
      include: {
        ...includes,
        avatar: true,
        banner: true,
        _count: {
          select: {
            bids: true
          }
        }
      },
      orderBy: {
        [sort]: sortOrder
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}
