import schedule from "node-schedule"
import { prisma } from "../../../utils"
import { getListing } from "./listings.service"
import { ListingWithBids } from "./listings.controller"

/**
 * Schedule a cron-job to transfer winning bid credits to the seller of the listing.
 * This should be called when a listing is created.
 * @param listingId id of the listing to schedule
 * @param endsAt date when listing ends
 */
export async function scheduleCreditsTransfer(listingId: string, endsAt: Date): Promise<void> {
  schedule.scheduleJob(endsAt, async () => {
    const listing = (await getListing(listingId, { bids: true })) as ListingWithBids

    if (listing.bids.length > 0) {
      const highestBid = Math.max(...listing.bids.map(bid => bid.amount), 0)

      await prisma.auctionProfile.update({
        where: { name: listing.sellerName },
        data: { credits: { increment: highestBid } }
      })
    }
  })
}
