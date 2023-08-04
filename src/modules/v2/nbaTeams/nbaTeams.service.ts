import { db, getRandomNumber } from "@/utils"

export async function getNbaTeams() {
  const [data, meta] = await db.nbaTeam.paginate().withPages()

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