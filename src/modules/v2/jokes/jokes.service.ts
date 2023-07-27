import { prisma, getRandomNumber } from "@/utils"

export async function getJokes() {
  const [data, meta] = await prisma.joke.paginate().withPages()

  return { data, meta }
}

export async function getJoke(id: number) {
  const [data, meta] = await prisma.joke
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function getRandomJoke() {
  const resultLength = await prisma.joke.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await prisma.joke
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
