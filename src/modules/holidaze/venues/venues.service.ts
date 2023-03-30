import { CreateVenueSchema } from "./venues.schema"
import { HolidazeVenue } from "@prisma/client"
import { prisma } from "../../../utils"
import { HolidazeVenueIncludes } from "./venues.controller"

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
  const DEFAULT_IMAGE = "https://source.unsplash.com/1600x900/?hotel"
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
