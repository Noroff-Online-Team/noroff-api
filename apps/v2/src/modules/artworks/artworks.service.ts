import type { Artwork } from "@prisma/v2-client"

import { db } from "@/utils"

import type {
  CreateArtworkSchema,
  UpdateArtworkSchema
} from "./artworks.schema"

export async function getArtworks(
  sort: keyof Artwork = "title",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.artwork
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        image: true,
        owner: {
          include: {
            avatar: true,
            banner: true
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

export async function getArtwork(id: string) {
  const [data] = await db.artwork
    .paginate({
      where: { id },
      include: {
        image: true,
        owner: {
          include: {
            avatar: true,
            banner: true
          }
        }
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function createArtwork(
  ownerName: string,
  createData: CreateArtworkSchema
) {
  const { image, ...rest } = createData

  const data = await db.artwork.create({
    data: {
      ...rest,
      ownerName,
      image: image?.url ? { create: image } : undefined
    },
    include: {
      image: true,
      owner: {
        include: {
          avatar: true,
          banner: true
        }
      }
    }
  })

  return { data }
}

export async function updateArtwork(
  id: string,
  updateData: UpdateArtworkSchema
) {
  const { image, ...rest } = updateData

  const data = await db.artwork.update({
    where: { id },
    data: {
      ...rest,
      image: image?.url ? { delete: {}, create: image } : undefined
    },
    include: {
      image: true,
      owner: {
        include: {
          avatar: true,
          banner: true
        }
      }
    }
  })

  return { data }
}

export async function deleteArtwork(id: string) {
  await db.artwork.delete({
    where: { id }
  })
}
