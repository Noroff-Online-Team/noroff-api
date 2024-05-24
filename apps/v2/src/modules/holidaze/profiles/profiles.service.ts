import { HolidazeBooking, HolidazeVenue, UserProfile } from "@prisma/v2-client"

import { db } from "@/utils"

import { HolidazeBookingIncludes } from "../bookings/bookings.controller"
import { HolidazeVenueIncludes } from "../venues/venues.controller"
import { HolidazeProfileIncludes } from "./profiles.controller"
import { UpdateProfileSchema } from "./profiles.schema"

export async function getProfiles(
  sort: keyof UserProfile = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: HolidazeProfileIncludes = {}
) {
  const venueMetaAndLocation = includes.venues
    ? { venues: { include: { media: true, meta: true, location: true } } }
    : {}
  const includeVenueIfBookings = includes.bookings
    ? { bookings: { include: { venue: { include: { media: true, meta: true, location: true } } } } }
    : {}

  const [data, meta] = await db.userProfile
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...venueMetaAndLocation,
        ...includeVenueIfBookings,
        avatar: true,
        banner: true,
        _count: {
          select: {
            venues: true,
            bookings: true
          }
        }
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getProfile(name: string, includes: HolidazeProfileIncludes = {}) {
  const venueMetaAndLocation = includes.venues
    ? { venues: { include: { media: true, meta: true, location: true } } }
    : {}
  const includeVenueIfBookings = includes.bookings
    ? { bookings: { include: { venue: { include: { media: true, meta: true, location: true } } } } }
    : {}

  const [data] = await db.userProfile
    .paginate({
      where: { name },
      include: {
        ...includes,
        ...venueMetaAndLocation,
        ...includeVenueIfBookings,
        avatar: true,
        banner: true,
        _count: {
          select: {
            venues: true,
            bookings: true
          }
        }
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function updateProfile(name: string, { avatar, banner, ...updateData }: UpdateProfileSchema) {
  const data = await db.userProfile.update({
    where: { name },
    data: {
      ...updateData,
      avatar: avatar ? { delete: {}, create: avatar } : undefined,
      banner: banner ? { delete: {}, create: banner } : undefined
    },
    include: {
      avatar: true,
      banner: true,
      _count: {
        select: {
          venues: true,
          bookings: true
        }
      }
    }
  })

  return { data }
}

export async function getProfileVenues(
  name: string,
  sort: keyof HolidazeVenue = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: HolidazeVenueIncludes = {}
) {
  const withProfileMedia = includes.owner ? { owner: { include: { avatar: true, banner: true } } } : {}
  const withBookings = includes.bookings
    ? { bookings: { include: { customer: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data, meta] = await db.holidazeVenue
    .paginate({
      where: { ownerName: name },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...withProfileMedia,
        ...withBookings,
        meta: true,
        location: true,
        media: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getProfileBookings(
  name: string,
  sort: keyof HolidazeBooking = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: HolidazeBookingIncludes = {}
) {
  const venueMetaAndLocation = includes.venue ? { venue: { include: { media: true, meta: true, location: true } } } : {}
  const withProfileMedia = includes.customer ? { customer: { include: { avatar: true, banner: true } } } : {}

  const [data, meta] = await db.holidazeBooking
    .paginate({
      where: { customerName: name },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...venueMetaAndLocation,
        ...withProfileMedia
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function searchProfiles(
  sort: keyof UserProfile = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  query: string,
  includes: HolidazeProfileIncludes = {}
) {
  const venueMetaAndLocation = includes.venues
    ? { venues: { include: { media: true, meta: true, location: true } } }
    : {}
  const includeVenueIfBookings = includes.bookings
    ? { bookings: { include: { venue: { include: { media: true, meta: true, location: true } } } } }
    : {}

  const [data, meta] = await db.userProfile
    .paginate({
      where: {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { bio: { contains: query, mode: "insensitive" } }]
      },
      include: {
        ...includes,
        ...venueMetaAndLocation,
        ...includeVenueIfBookings,
        avatar: true,
        banner: true,
        _count: {
          select: {
            venues: true,
            bookings: true
          }
        }
      },
      orderBy: {
        [sort]: sortOrder
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}
