import { CreateVenueSchema, UpdateVenueSchema } from "./venues.schema"
import { HolidazeVenue } from "@prisma-api-v2/client"
import { db } from "@/utils"
import { HolidazeVenueIncludes } from "./venues.controller"

const DEFAULT_MEDIA = ["https://source.unsplash.com/1600x900/?hotel"]

export async function getVenues(
  sort: keyof HolidazeVenue = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: HolidazeVenueIncludes = {}
) {
  const [data, meta] = await db.holidazeVenue
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        meta: true,
        location: true
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getVenue(id: string, includes: HolidazeVenueIncludes = {}) {
  const [data, meta] = await db.holidazeVenue
    .paginate({
      where: { id },
      include: {
        ...includes,
        meta: true,
        location: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function createVenue(
  ownerName: string,
  createData: CreateVenueSchema,
  includes: HolidazeVenueIncludes = {}
) {
  const { meta, location, ...rest } = createData

  const venueMeta = await db.holidazeVenueMeta.create({
    data: { ...meta }
  })

  const venueLocation = await db.holidazeVenueLocation.create({
    data: { ...location }
  })

  const data = await db.holidazeVenue.create({
    data: {
      ...rest,
      media: createData.media || DEFAULT_MEDIA,
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

  return { data }
}

export async function updateVenue(id: string, updateData: UpdateVenueSchema, includes: HolidazeVenueIncludes = {}) {
  const { meta, location, ...rest } = updateData

  const data = await db.holidazeVenue.update({
    where: { id },
    data: {
      ...rest,
      media: updateData.media || DEFAULT_MEDIA,
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

  return { data }
}

export async function deleteVenue(id: string) {
  return await db.holidazeVenue.delete({
    where: { id }
  })
}
