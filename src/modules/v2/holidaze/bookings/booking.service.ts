import { HolidazeBooking } from "@prisma-api-v2/client"
import { db } from "@/utils"
import { HolidazeBookingIncludes } from "./bookings.controller"
import { CreateBookingSchema, UpdateBookingSchema } from "./bookings.schema"

export async function getBookings(
  sort: keyof HolidazeBooking = "id",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: HolidazeBookingIncludes = {}
) {
  const withCustomerMedia = includes.customer ? { customer: { include: { avatar: true, banner: true } } } : {}
  const venueMetaAndLocation = includes.venue
    ? { venue: { include: { meta: true, location: true, owner: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data, meta] = await db.holidazeBooking
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...withCustomerMedia,
        ...venueMetaAndLocation
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getBooking(id: string, includes: HolidazeBookingIncludes = {}) {
  const withCustomerMedia = includes.customer ? { customer: { include: { avatar: true, banner: true } } } : {}
  const venueMetaAndLocation = includes.venue
    ? { venue: { include: { meta: true, location: true, owner: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data, meta] = await db.holidazeBooking
    .paginate({
      where: { id },
      include: {
        ...includes,
        ...withCustomerMedia,
        ...venueMetaAndLocation
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function createBooking(
  createData: CreateBookingSchema & { customerName: string },
  includes: HolidazeBookingIncludes = {}
) {
  const withCustomerMedia = includes.customer ? { customer: { include: { avatar: true, banner: true } } } : {}
  const venueMetaAndLocation = includes.venue
    ? { venue: { include: { meta: true, location: true, owner: { include: { avatar: true, banner: true } } } } }
    : {}

  const data = await db.holidazeBooking.create({
    data: {
      ...createData
    },
    include: {
      ...includes,
      ...withCustomerMedia,
      ...venueMetaAndLocation
    }
  })

  return { data }
}

export async function updateBooking(
  id: string,
  updateData: UpdateBookingSchema,
  includes: HolidazeBookingIncludes = {}
) {
  const withCustomerMedia = includes.customer ? { customer: { include: { avatar: true, banner: true } } } : {}
  const venueMetaAndLocation = includes.venue
    ? { venue: { include: { meta: true, location: true, owner: { include: { avatar: true, banner: true } } } } }
    : {}

  const data = await db.holidazeBooking.update({
    where: { id },
    data: {
      ...updateData
    },
    include: {
      ...includes,
      ...withCustomerMedia,
      ...venueMetaAndLocation
    }
  })

  return { data }
}

export async function deleteBooking(id: string) {
  return await db.holidazeBooking.delete({
    where: { id }
  })
}
