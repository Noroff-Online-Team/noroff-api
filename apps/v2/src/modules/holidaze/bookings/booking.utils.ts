import { db } from "@/utils"

export async function checkForOverlappingBookings(venueId: string, dateFrom: Date, dateTo: Date): Promise<boolean> {
  const overlappingBookings = await db.holidazeBooking.findMany({
    where: {
      venueId,
      OR: [
        {
          dateFrom: {
            lte: dateTo
          },
          dateTo: {
            gte: dateFrom
          }
        }
      ]
    }
  })

  return overlappingBookings.length > 0
}
