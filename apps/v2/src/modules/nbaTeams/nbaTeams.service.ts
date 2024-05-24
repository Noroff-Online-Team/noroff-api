import { getRandomNumber } from "@noroff/api-utils"
import { NbaTeam } from "@prisma/v2-client"

import { db } from "@/utils"

export async function getNbaTeams(
  sort: keyof NbaTeam = "id",
  sortOrder: "asc" | "desc" = "asc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.nbaTeam
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

export async function getNbaTeam(id: number) {
  const [data] = await db.nbaTeam
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function getRandomNbaTeam() {
  const resultLength = await db.nbaTeam.count()
  const id = getRandomNumber(1, resultLength)

  const [data] = await db.nbaTeam
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}
