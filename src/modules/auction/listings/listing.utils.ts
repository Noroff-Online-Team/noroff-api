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
    // Get listing
    const listing = (await getListing(listingId, { bids: true })) as ListingWithBids

    if (listing.bids.length > 0) {
      // Get highest bid of listing
      const [winner, ...losers] = listing.bids.sort((a, b) => b.amount - a.amount)

      // Transfer credits from highest bid to seller
      await prisma.auctionProfile.update({
        where: { name: listing.sellerName },
        data: { credits: { increment: winner.amount } }
      })

      // Transfer all non-winning bids back to their bidders
      await Promise.all(
        losers.map(bid =>
          prisma.auctionProfile.update({
            where: { name: bid.bidderName },
            data: { credits: { increment: bid.amount } }
          })
        )
      )
    }
  })
}
