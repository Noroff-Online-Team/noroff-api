import { getRandomNumber } from "@noroff/api-utils"
import { OldGame } from "@prisma/v2-client"

import { db } from "@/utils"

export async function getOldGames(
  sort: keyof OldGame = "id",
  sortOrder: "asc" | "desc" = "asc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.oldGame
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        image: true
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getOldGame(id: number) {
  const [data] = await db.oldGame
    .paginate({
      where: { id },
      include: {
        image: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function getRandomOldGame() {
  const resultLength = await db.oldGame.count()
  const id = getRandomNumber(1, resultLength)

  const [data] = await db.oldGame
    .paginate({
      where: { id },
      include: {
        image: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}
