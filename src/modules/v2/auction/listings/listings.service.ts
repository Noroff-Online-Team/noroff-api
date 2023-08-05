import { AuctionListing } from "@prisma/client"
import { db } from "@/utils"
import { AuctionListingIncludes } from "./listings.controller"
import { CreateListingSchema, UpdateListingSchema } from "./listings.schema"
import { scheduleCreditsTransfer } from "./listing.utils"

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

  const [data, meta] = await db.auctionListing
    .paginate({
      where: {
        ...whereTag,
        ...whereActive
      },
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
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getListing(id: string, includes: AuctionListingIncludes = {}) {
  const [data, meta] = await db.auctionListing
    .paginate({
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
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function createListing(data: CreateListingSchema, seller: string, includes: AuctionListingIncludes = {}) {
  const listing = await db.auctionListing.create({
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

  return { data: listing }
}

export async function updateListing(id: string, data: UpdateListingSchema, includes: AuctionListingIncludes = {}) {
  const updatedListing = await db.auctionListing.update({
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

  return { data: updatedListing }
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

  const data = await db.auctionBid.create({
    data: {
      listingId: id,
      bidderName,
      amount,
      created: new Date()
    }
  })

  return { data }
}
