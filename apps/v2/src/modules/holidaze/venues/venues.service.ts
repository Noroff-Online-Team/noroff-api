import { HolidazeVenue } from "@prisma/v2-client"

import { db } from "@/utils"

import { HolidazeVenueIncludes } from "./venues.controller"
import { CreateVenueSchema, UpdateVenueSchema } from "./venues.schema"

const DEFAULT_MEDIA = [
  {
    url: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?crop=entropy&fit=crop&h=900&q=80&w=1600",
    alt: "A hotel room with a bed, chair and table"
  }
]

export async function getVenues(
  sort: keyof HolidazeVenue = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: HolidazeVenueIncludes = {}
) {
  const withOwnerMedia = includes.owner ? { owner: { include: { avatar: true, banner: true } } } : {}
  const withBookingCustomer = includes.bookings
    ? { bookings: { include: { customer: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data, meta] = await db.holidazeVenue
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...withOwnerMedia,
        ...withBookingCustomer,
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

export async function getVenue(id: string, includes: HolidazeVenueIncludes = {}) {
  const withOwnerMedia = includes.owner ? { owner: { include: { avatar: true, banner: true } } } : {}
  const withBookingCustomer = includes.bookings
    ? { bookings: { include: { customer: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data] = await db.holidazeVenue
    .paginate({
      where: { id },
      include: {
        ...includes,
        ...withOwnerMedia,
        ...withBookingCustomer,
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
      limit: 1
    })

  return { data: data[0] }
}

export async function createVenue(
  ownerName: string,
  createData: CreateVenueSchema,
  includes: HolidazeVenueIncludes = {}
) {
  const { meta, location, media, ...rest } = createData
  const withOwnerMedia = includes.owner ? { owner: { include: { avatar: true, banner: true } } } : {}
  const withBookingCustomer = includes.bookings
    ? { bookings: { include: { customer: { include: { avatar: true, banner: true } } } } }
    : {}

  const venueMeta = await db.holidazeVenueMeta.create({
    data: { ...meta }
  })

  const venueLocation = await db.holidazeVenueLocation.create({
    data: { ...location }
  })

  const data = await db.holidazeVenue.create({
    data: {
      ...rest,
      media: media ? { createMany: { data: media } } : { createMany: { data: DEFAULT_MEDIA } },
      ownerName,
      metaId: venueMeta.id,
      locationId: venueLocation.id
    },
    include: {
      ...includes,
      ...withOwnerMedia,
      ...withBookingCustomer,
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

  return { data }
}

export async function updateVenue(id: string, updateData: UpdateVenueSchema, includes: HolidazeVenueIncludes = {}) {
  const { meta, location, media, ...rest } = updateData
  const withOwnerMedia = includes.owner ? { owner: { include: { avatar: true, banner: true } } } : {}
  const withBookingCustomer = includes.bookings
    ? { bookings: { include: { customer: { include: { avatar: true, banner: true } } } } }
    : {}

  const data = await db.holidazeVenue.update({
    where: { id },
    data: {
      ...rest,
      media: media
        ? { deleteMany: {}, createMany: { data: media } }
        : { deleteMany: {}, createMany: { data: DEFAULT_MEDIA } },
      meta: {
        update: {
          ...meta
        }
      },
      location: {
        update: {
          ...location
        }
      }
    },
    include: {
      ...includes,
      ...withOwnerMedia,
      ...withBookingCustomer,
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

  return { data }
}

export async function deleteVenue(id: string) {
  return await db.holidazeVenue.delete({
    where: { id }
  })
}

export async function searchVenues(
  sort: keyof HolidazeVenue = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  query: string,
  includes: HolidazeVenueIncludes = {}
) {
  const withOwnerMedia = includes.owner ? { owner: { include: { avatar: true, banner: true } } } : {}
  const withBookingCustomer = includes.bookings
    ? { bookings: { include: { customer: { include: { avatar: true, banner: true } } } } }
    : {}

  const [data, meta] = await db.holidazeVenue
    .paginate({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } }
        ]
      },
      include: {
        ...includes,
        ...withOwnerMedia,
        ...withBookingCustomer,
        meta: true,
        location: true,
        media: true,
        _count: {
          select: {
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
