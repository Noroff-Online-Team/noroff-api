import { AuctionListing } from "@prisma/v2-client"

import { db } from "@/utils"

import { scheduleCreditsTransfer } from "./listing.utils"
import { AuctionListingIncludes } from "./listings.controller"
import { CreateListingSchema, UpdateListingSchema } from "./listings.schema"

export async function getListings(
  sort: keyof AuctionListing = "title",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: AuctionListingIncludes = {},
  tag: string | undefined,
  active: boolean | undefined
) {
  const whereTag = tag ? { tags: { has: tag } } : {}
  const whereActive = active ? { endsAt: { gte: new Date() } } : {}
  const withSellerMedia = includes.seller ? { seller: { include: { avatar: true, banner: true } } } : {}
  const withBidderMedia = includes.bids
    ? { bids: { include: { bidder: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data, meta] = await db.auctionListing
    .paginate({
      where: {
        ...whereTag,
        ...whereActive
      },
      include: {
        ...includes,
        ...withSellerMedia,
        ...withBidderMedia,
        media: true,
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

export async function getListing(id: string, includes: AuctionListingIncludes = {}) {
  const withSellerMedia = includes.seller ? { seller: { include: { avatar: true, banner: true } } } : {}
  const withBidderMedia = includes.bids
    ? { bids: { include: { bidder: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data] = await db.auctionListing
    .paginate({
      where: { id },
      include: {
        ...includes,
        ...withSellerMedia,
        ...withBidderMedia,
        media: true,
        _count: {
          select: {
            bids: true
          }
        }
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function createListing(data: CreateListingSchema, seller: string, includes: AuctionListingIncludes = {}) {
  const withSellerMedia = includes.seller ? { seller: { include: { avatar: true, banner: true } } } : {}
  const withBidderMedia = includes.bids
    ? { bids: { include: { bidder: { include: { avatar: true, banner: true } } } } }
    : {}

  const listing = await db.auctionListing.create({
    data: {
      ...data,
      sellerName: seller,
      tags: data.tags || [],
      media: data.media ? { create: data.media } : undefined
    },
    include: {
      ...includes,
      ...withSellerMedia,
      ...withBidderMedia,
      media: true,
      _count: {
        select: {
          bids: true
        }
      }
    }
  })

  await scheduleCreditsTransfer(listing.id, listing.endsAt)

  return { data: listing }
}

export async function updateListing(
  id: string,
  updateData: UpdateListingSchema,
  includes: AuctionListingIncludes = {}
) {
  const withSellerMedia = includes.seller ? { seller: { include: { avatar: true, banner: true } } } : {}
  const withBidderMedia = includes.bids
    ? { bids: { include: { bidder: { include: { avatar: true, banner: true } } } } }
    : {}

  const data = await db.auctionListing.update({
    where: { id },
    data: {
      ...updateData,
      title: updateData.title || undefined,
      tags: updateData.tags || undefined,
      media: updateData.media ? { deleteMany: {}, create: updateData.media } : undefined
    },
    include: {
      ...includes,
      ...withSellerMedia,
      ...withBidderMedia,
      media: true,
      _count: {
        select: {
          bids: true
        }
      }
    }
  })

  return { data }
}

export async function refundCredits(id: string) {
  const listing = await db.auctionListing.findUnique({
    where: { id },
    include: { bids: true }
  })

  if (listing) {
    await Promise.all(
      listing.bids.map(bid =>
        db.userProfile.update({
          where: { name: bid.bidderName },
          data: {
            credits: {
              increment: bid.amount
            }
          }
        })
      )
    )
  }
}

export async function deleteListing(id: string) {
  await refundCredits(id)

  return await db.auctionListing.delete({
    where: { id }
  })
}

export async function createListingBid(id: string, bidderName: string, amount: number) {
  await db.userProfile.update({
    where: { name: bidderName },
    data: { credits: { decrement: amount } }
  })

  await db.auctionBid.create({
    data: {
      listingId: id,
      bidderName,
      amount
    }
  })
}

export async function searchListings(
  sort: keyof AuctionListing = "title",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  query: string,
  includes: AuctionListingIncludes = {}
) {
  const withSellerMedia = includes.seller ? { seller: { include: { avatar: true, banner: true } } } : {}
  const withBidderMedia = includes.bids
    ? { bids: { include: { bidder: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data, meta] = await db.auctionListing
    .paginate({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } }
        ]
      },
      include: {
        ...includes,
        ...withSellerMedia,
        ...withBidderMedia,
        media: true,
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
