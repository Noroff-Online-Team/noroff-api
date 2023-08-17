import { AuctionListing } from "@prisma-api-v1/client"
import { prisma } from "@/utils"
import { AuctionListingIncludes } from "./listings.controller"
import { CreateListingSchema, UpdateListingSchema } from "./listings.schema"
import { scheduleCreditsTransfer } from "./listing.utils"

export async function getListings(
  sort: keyof AuctionListing = "title",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: AuctionListingIncludes = {},
  tag: string | undefined,
  active: boolean | undefined
) {
  const whereTag = tag ? { tags: { has: tag } } : {}
  const whereActive = active ? { endsAt: { gte: new Date() } } : {}

  return await prisma.auctionListing.findMany({
    include: {
      ...includes,
      _count: {
        select: {
          bids: true
        }
      }
    },
    where: {
      ...whereTag,
      ...whereActive
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
  const listing = await prisma.auctionListing.create({
    data: {
      ...data,
      sellerName: seller,
      media: data.media || [],
      tags: data.tags || [],
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

  await scheduleCreditsTransfer(listing.id, listing.endsAt)
  return listing
}

export async function updateListing(id: string, data: UpdateListingSchema, includes: AuctionListingIncludes = {}) {
  return await prisma.auctionListing.update({
    where: { id },
    data: {
      ...data,
      title: data.title || undefined,
      media: data.media || undefined,
      tags: data.tags || undefined,
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

export async function refundCredits(id: string) {
  const listing = await prisma.auctionListing.findUnique({
    where: { id },
    include: {
      bids: true
    }
  })

  if (listing) {
    await Promise.all(
      listing.bids.map(bid =>
        prisma.auctionProfile.update({
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

  return await prisma.auctionListing.delete({
    where: { id }
  })
}

export async function createListingBid(id: string, bidderName: string, amount: number) {
  await prisma.auctionProfile.update({
    where: { name: bidderName },
    data: { credits: { decrement: amount } }
  })

  return await prisma.auctionBid.create({
    data: {
      listingId: id,
      bidderName,
      amount,
      created: new Date()
    }
  })
}
