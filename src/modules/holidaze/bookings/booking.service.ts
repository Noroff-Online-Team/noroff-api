import { HolidazeBooking } from "@prisma/client"
import { prisma } from "../../../utils"
import { HolidazeBookingIncludes } from "./bookings.controller"
import { CreateBookingSchema, UpdateBookingSchema } from "./bookings.schema"

export async function getBookings(
  sort: keyof HolidazeBooking = "id",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: HolidazeBookingIncludes = {}
) {
  const venueMetaAndLocation = includes.venue ? { venue: { include: { meta: true, location: true } } } : {}

  return await prisma.holidazeBooking.findMany({
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes,
      ...venueMetaAndLocation
    }
  })
}

export async function getBooking(id: string, includes: HolidazeBookingIncludes = {}) {
  const venueMetaAndLocation = includes.venue ? { venue: { include: { meta: true, location: true } } } : {}

  return await prisma.holidazeBooking.findUnique({
    where: { id },
    include: {
      ...includes,
      ...venueMetaAndLocation
    }
  })
}

export async function createBooking(data: CreateBookingSchema, includes: HolidazeBookingIncludes = {}) {
  const venueMetaAndLocation = includes.venue ? { venue: { include: { meta: true, location: true } } } : {}

  return await prisma.holidazeBooking.create({
    data: {
      ...data,
      created: new Date(),
      updated: new Date()
    },
    include: {
      ...includes,
      ...venueMetaAndLocation
    }
  })
}

export async function updateBooking(id: string, data: UpdateBookingSchema, includes: HolidazeBookingIncludes = {}) {
  const venueMetaAndLocation = includes.venue ? { venue: { include: { meta: true, location: true } } } : {}

  return await prisma.holidazeBooking.update({
    where: { id },
    data: {
      ...data,
      updated: new Date()
    },
    include: {
      ...includes,
      ...venueMetaAndLocation
    }
  })
}

export async function deleteBooking(id: string) {
  return await prisma.holidazeBooking.delete({
    where: { id }
  })
}
