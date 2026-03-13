import type { RecipeFavorite } from "@prisma/v2-client"

import { db } from "@/utils"

const favoriteIncludes = {
  recipe: {
    include: {
      image: true,
      owner: { include: { avatar: true, banner: true } }
    }
  },
  owner: { include: { avatar: true, banner: true } }
}

export async function getFavorites(
  ownerName: string,
  sort: keyof RecipeFavorite = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.recipeFavorite
    .paginate({
      where: { ownerName },
      orderBy: {
        [sort]: sortOrder
      },
      include: favoriteIncludes
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getFavorite(recipeId: string, ownerName: string) {
  const data = await db.recipeFavorite.findUnique({
    where: {
      recipeId_ownerName: { recipeId, ownerName }
    },
    include: favoriteIncludes
  })

  return { data }
}

export async function createFavorite(recipeId: string, ownerName: string) {
  const data = await db.recipeFavorite.create({
    data: {
      recipeId,
      ownerName
    },
    include: favoriteIncludes
  })

  return { data }
}

export async function deleteFavorite(recipeId: string, ownerName: string) {
  await db.recipeFavorite.delete({
    where: {
      recipeId_ownerName: { recipeId, ownerName }
    }
  })
}
