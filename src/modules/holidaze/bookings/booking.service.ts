import { HolidazeBooking } from "@prisma/client"
import { prisma } from "../../../utils"
import { HolidazeBookingIncludes } from "./bookings.controller"
import { CreateBookingSchema } from "./bookings.schema"

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

export async function getBooking(id: string, includes: HolidazeBookingIncludes = {}) {
  const venueMeta = includes.venue ? { venue: { include: { meta: true } } } : {}

  return await prisma.holidazeBooking.findUnique({
    where: { id },
    include: {
      ...includes,
      ...venueMeta
    }
  })
}

export async function createBooking(data: CreateBookingSchema, includes: HolidazeBookingIncludes = {}) {
  const venueMeta = includes.venue ? { venue: { include: { meta: true } } } : {}

  return await prisma.holidazeBooking.create({
    data: {
      ...data,
      created: new Date(),
      updated: new Date()
    },
    include: {
      ...includes,
      ...venueMeta
    }
  })
}

export async function deleteBooking(id: string) {
  return await prisma.holidazeBooking.delete({
    where: { id }
  })
}
