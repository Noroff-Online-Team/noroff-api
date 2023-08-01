import { db, getRandomNumber } from "@/utils"

export async function getJokes() {
  const [data, meta] = await db.joke.paginate().withPages()

  return { data, meta }
}

export async function getJoke(id: number) {
  const [data, meta] = await db.joke
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function getRandomJoke() {
  const resultLength = await db.joke.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await db.joke
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
