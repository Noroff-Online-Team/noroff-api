import { prisma, getRandomNumber } from "../../utils"

export async function getJokes() {
  return prisma.joke.findMany()
}

export async function getJoke(id: number) {
  return prisma.joke.findUnique({
    where: { id }
  })
}

export async function getRandomJoke() {
  const resultLength = await prisma.joke.count()
  const id = getRandomNumber(0, resultLength)

  return prisma.joke.findUnique({
    where: { id }
  })
}
