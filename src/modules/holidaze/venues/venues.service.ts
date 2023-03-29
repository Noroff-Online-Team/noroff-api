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
