import { prisma, getRandomNumber } from "../../utils"

export async function getCatFacts() {
  return await prisma.catFact.findMany()
}

export async function getCatFact(id: number) {
  return await prisma.catFact.findUnique({
    where: { id }
  })
}

export async function getRandomCatFact() {
  const resultLength = await prisma.catFact.count()
  const id = getRandomNumber(0, resultLength)

  return await prisma.catFact.findUnique({
    where: { id }
  })
}
