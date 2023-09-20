import { HolidazeBooking, HolidazeProfile, HolidazeVenue } from "@prisma/v1-client"
import { prisma } from "@/utils"
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
  const venueMetaAndLocation = includes.venues ? { venues: { include: { meta: true, location: true } } } : {}

  return await prisma.holidazeProfile.findMany({
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes,
      ...venueMetaAndLocation,
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
  const venueMetaAndLocation = includes.venues ? { venues: { include: { meta: true, location: true } } } : {}
  const includeVenueIfBookings = includes.bookings
    ? { bookings: { include: { venue: { include: { meta: true, location: true } } } } }
    : {}

  return await prisma.holidazeProfile.findUnique({
    where: { name },
    include: {
      ...includes,
      ...venueMetaAndLocation,
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

export async function updateProfile(name: string, venueManager: boolean) {
  return await prisma.holidazeProfile.update({
    where: { name },
    data: {
      venueManager
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
      location: true,
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
  const venueMetaAndLocation = includes.venue ? { venue: { include: { meta: true, location: true } } } : {}

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
      ...venueMetaAndLocation
    }
  })
}
