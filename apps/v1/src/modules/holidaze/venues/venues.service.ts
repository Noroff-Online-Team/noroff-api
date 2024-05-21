import { HolidazeVenue } from "@/prisma/generated/v1-client"

import { prisma } from "@/utils"

import { HolidazeVenueIncludes } from "./venues.controller"
import { CreateVenueSchema, UpdateVenueSchema } from "./venues.schema"

const DEFAULT_MEDIA = ["https://source.unsplash.com/1600x900/?hotel"]

export async function getVenues(
  sort: keyof HolidazeVenue = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: HolidazeVenueIncludes = {}
) {
  return await prisma.holidazeVenue.findMany({
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes,
      meta: true,
      location: true
    }
  })
}

export async function getVenue(id: string, includes: HolidazeVenueIncludes = {}) {
  return await prisma.holidazeVenue.findUnique({
    where: { id },
    include: {
      ...includes,
      meta: true,
      location: true
    }
  })
}

export async function createVenue(data: CreateVenueSchema, ownerName: string, includes: HolidazeVenueIncludes = {}) {
  const { meta, location, ...rest } = data

  const venueMeta = await prisma.holidazeVenueMeta.create({
    data: { ...meta }
  })

  const venueLocation = await prisma.holidazeVenueLocation.create({
    data: { ...location }
  })

  return await prisma.holidazeVenue.create({
    data: {
      ...rest,
      media: data.media || DEFAULT_MEDIA,
      created: new Date(),
      updated: new Date(),
      ownerName,
      metaId: venueMeta.id,
      locationId: venueLocation.id
    },
    include: {
      ...includes,
      meta: true,
      location: true
    }
  })
}

export async function updateVenue(id: string, data: UpdateVenueSchema, includes: HolidazeVenueIncludes = {}) {
  const { meta, location, ...rest } = data

  return await prisma.holidazeVenue.update({
    where: { id },
    data: {
      ...rest,
      media: data.media || DEFAULT_MEDIA,
      updated: new Date(),
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
      meta: true,
      location: true
    }
  })
}

export async function deleteVenue(id: string) {
  return await prisma.holidazeVenue.delete({
    where: { id }
  })
}
