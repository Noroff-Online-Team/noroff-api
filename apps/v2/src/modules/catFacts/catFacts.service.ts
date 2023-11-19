import { getRandomNumber } from "@noroff/api-utils"
import { CatFact } from "@prisma/v2-client"

import { db } from "@/utils"

export async function getCatFacts(
  sort: keyof CatFact = "id",
  sortOrder: "asc" | "desc" = "asc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.catFact
    .paginate({
      orderBy: {
        [sort]: sortOrder
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getCatFact(id: number) {
  const [data] = await db.catFact
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function getRandomCatFact() {
  const resultLength = await db.catFact.count()
  const id = getRandomNumber(1, resultLength)

  const [data] = await db.catFact
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}
