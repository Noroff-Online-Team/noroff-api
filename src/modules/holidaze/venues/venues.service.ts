import { CreateVenueSchema, UpdateVenueSchema } from "./venues.schema"
import { HolidazeVenue } from "@prisma/client"
import { prisma } from "../../../utils"
import { HolidazeVenueIncludes } from "./venues.controller"

const DEFAULT_IMAGE = "https://source.unsplash.com/1600x900/?hotel"

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
      meta: true
    }
  })
}

export async function getVenue(id: string, includes: HolidazeVenueIncludes = {}) {
  return await prisma.holidazeVenue.findUnique({
    where: { id },
    include: {
      ...includes,
      meta: true
    }
  })
}

export async function createVenue(data: CreateVenueSchema, ownerName: string, includes: HolidazeVenueIncludes = {}) {
  const { meta, ...rest } = data

  const venueMeta = await prisma.holidazeVenueMeta.create({
    data: { ...meta }
  })

  return await prisma.holidazeVenue.create({
    data: {
      ...rest,
      media: data.media || DEFAULT_IMAGE,
      created: new Date(),
      updated: new Date(),
      ownerName,
      metaId: venueMeta.id
    },
    include: {
      ...includes,
      meta: true
    }
  })
}

export async function updateVenue(id: string, data: UpdateVenueSchema, includes: HolidazeVenueIncludes = {}) {
  const { meta, ...rest } = data

  return await prisma.holidazeVenue.update({
    where: { id },
    data: {
      ...rest,
      media: data.media || DEFAULT_IMAGE,
      updated: new Date(),
      meta: {
        update: {
          ...meta
        }
      }
    },
    include: {
      ...includes,
      meta: true
    }
  })
}

export async function deleteVenue(id: string) {
  return await prisma.holidazeVenue.delete({
    where: { id }
  })
}
