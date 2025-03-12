import type { Pet } from "@prisma/v2-client"

import { db } from "@/utils"

import type { CreatePetSchema, UpdatePetSchema } from "./pets.schema"

export async function getPets(
  sort: keyof Pet = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.pet
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

export async function getPet(id: string) {
  const [data] = await db.pet
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

export async function createPet(
  ownerName: string,
  createData: CreatePetSchema
) {
  const { image, ...rest } = createData

  const data = await db.pet.create({
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

export async function updatePet(id: string, updateData: UpdatePetSchema) {
  const { image, ...rest } = updateData

  const data = await db.pet.update({
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

export async function deletePet(id: string) {
  await db.pet.delete({
    where: { id }
  })
}
