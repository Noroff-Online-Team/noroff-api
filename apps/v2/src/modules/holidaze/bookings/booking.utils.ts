import { NotFound } from "http-errors"

import { db } from "@/utils"

import { CreateBookingSchema } from "./bookings.schema"

export async function checkForOverlappingBookings({
  venueId,
  dateFrom,
  dateTo,
  guests
}: CreateBookingSchema): Promise<boolean> {
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

  const venue = await db.holidazeVenue.findUnique({
    where: { id: venueId }
  })

  if (!venue) {
    throw new NotFound("No venue with this id")
  }

  const totalGuests = overlappingBookings.reduce((acc, booking) => acc + booking.guests, 0) + guests

  return totalGuests > venue.maxGuests && overlappingBookings.length > 0
}
