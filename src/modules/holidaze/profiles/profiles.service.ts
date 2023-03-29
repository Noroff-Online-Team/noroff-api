import { HolidazeBooking, HolidazeProfile, HolidazeVenue } from "@prisma/client"
import { prisma } from "../../../utils"
import { HolidazeBookingIncludes } from "../bookings/bookings.controller"
import { HolidazeVenueIncludes } from "../venues/venues.controller"
import { HolidazeProfileIncludes } from "./profiles.controller"
import { ProfileMediaSchema } from "./profiles.schema"

export async function getProfiles(
  sort: keyof HolidazeProfile = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: HolidazeProfileIncludes = {}
) {
  return await prisma.holidazeProfile.findMany({
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes,
      _count: {
        select: {
          venues: true,
          bookings: true
        }
      }
    }
  })
}

export async function getProfile(name: string, includes: HolidazeProfileIncludes = {}) {
  const venueMeta = includes.venues ? { venues: { include: { meta: true } } } : {}
  const includeVenueIfBookings = includes.bookings
    ? { bookings: { include: { venue: { include: { meta: true } } } } }
    : {}

  return await prisma.holidazeProfile.findUnique({
    where: { name },
    include: {
      ...includes,
      ...venueMeta,
      ...includeVenueIfBookings,
      _count: {
        select: {
          venues: true,
          bookings: true
        }
      }
    }
  })
}

export async function updateProfileMedia(name: string, { avatar }: ProfileMediaSchema) {
  return await prisma.holidazeProfile.update({
    where: { name },
    data: {
      avatar
    }
  })
}

export async function getProfileVenues(
  name: string,
  sort: keyof HolidazeVenue = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: HolidazeVenueIncludes = {}
) {
  return await prisma.holidazeVenue.findMany({
    where: {
      ownerName: name
    },
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes,
      meta: true,
      _count: {
        select: {
          bookings: true
        }
      }
    }
  })
}

export async function getProfileBookings(
  name: string,
  sort: keyof HolidazeBooking = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: HolidazeBookingIncludes = {}
) {
  const venueMeta = includes.venue ? { venue: { include: { meta: true } } } : {}

  return await prisma.holidazeBooking.findMany({
    where: {
      customerName: name
    },
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
