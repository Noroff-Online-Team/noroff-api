import { NbaTeam } from "@prisma-api-v2/client"
import { db, getRandomNumber } from "@/utils"

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
  const [data, meta] = await db.nbaTeam
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function getRandomNbaTeam() {
  const resultLength = await db.nbaTeam.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await db.nbaTeam
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
