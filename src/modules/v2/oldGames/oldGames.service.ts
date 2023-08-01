import { db, getRandomNumber } from "@/utils"

export async function getOldGames() {
  const [data, meta] = await db.oldGame.paginate().withPages()

  return { data, meta }
}

export async function getOldGame(id: number) {
  const [data, meta] = await db.oldGame
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function getRandomOldGame() {
  const resultLength = await db.oldGame.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await db.oldGame
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
