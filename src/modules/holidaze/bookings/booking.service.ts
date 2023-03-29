import { HolidazeBooking } from "@prisma/client"
import { prisma } from "../../../utils"
import { HolidazeBookingIncludes } from "./bookings.controller"

export async function getBookings(
  sort: keyof HolidazeBooking = "id",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: HolidazeBookingIncludes = {}
) {
  const venueMeta = includes.venue ? { venue: { include: { meta: true } } } : {}

  return await prisma.holidazeBooking.findMany({
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes,
      ...venueMeta
    }
  })
}
