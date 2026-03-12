import type { PantryItem } from "@prisma/v2-client"

import { db } from "@/utils"
import type {
  CreatePantryItemSchema,
  UpdatePantryItemSchema
} from "./pantry.schema"

const pantryIncludes = {
  owner: { include: { avatar: true, banner: true } }
}

export async function getPantryItems(
  ownerName: string,
  sort: keyof PantryItem = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.pantryItem
    .paginate({
      where: { ownerName },
      orderBy: {
        [sort]: sortOrder
      },
      include: pantryIncludes
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getPantryItem(id: string) {
  const [data] = await db.pantryItem
    .paginate({
      where: { id },
      include: pantryIncludes
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function createPantryItem(
  ownerName: string,
  createData: CreatePantryItemSchema
) {
  const data = await db.pantryItem.create({
    data: {
      ...createData,
      ownerName
    },
    include: pantryIncludes
  })

  return { data }
}

export async function updatePantryItem(
  id: string,
  updateData: UpdatePantryItemSchema
) {
  const data = await db.pantryItem.update({
    where: { id },
    data: updateData,
    include: pantryIncludes
  })

  return { data }
}

export async function deletePantryItem(id: string) {
  await db.pantryItem.delete({
    where: { id }
  })
}
