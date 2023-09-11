import { HolidazeBooking, UserProfile, HolidazeVenue } from "@prisma-api-v2/client"
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
  const venueMetaAndLocation = includes.venues ? { venues: { include: { meta: true, location: true } } } : {}

  const [data, meta] = await db.userProfile
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
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
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getProfile(name: string, includes: HolidazeProfileIncludes = {}) {
  const venueMetaAndLocation = includes.venues ? { venues: { include: { meta: true, location: true } } } : {}
  const includeVenueIfBookings = includes.bookings
    ? { bookings: { include: { venue: { include: { meta: true, location: true } } } } }
    : {}

  const [data, meta] = await db.userProfile
    .paginate({
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
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function updateProfile(name: string, { avatar, banner, ...updateData }: UpdateProfileSchema) {
  const data = await db.userProfile.update({
    where: { name },
    data: {
      ...updateData,
      avatar: avatar ? { delete: {}, create: avatar } : undefined,
      banner: banner ? { delete: {}, create: banner } : undefined
    },
    include: { avatar: true, banner: true }
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

  const [data, meta] = await db.holidazeVenue
    .paginate({
      where: { ownerName: name },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...withProfileMedia,
        meta: true,
        location: true,
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
  const venueMetaAndLocation = includes.venue ? { venue: { include: { meta: true, location: true } } } : {}
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
