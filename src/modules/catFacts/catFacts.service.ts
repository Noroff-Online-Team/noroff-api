import prisma from "../../utils/prisma"
import { getRandomNumber } from "../../utils"

export async function getCatFacts() {
  return prisma.catFact.findMany()
}

export async function getCatFact(id: number) {
  return prisma.catFact.findUnique({
    where: { id }
  })
}

export async function getRandomCatFact() {
  const resultLength = await prisma.catFact.count()
  const id = getRandomNumber(0, resultLength)

  return prisma.catFact.findUnique({
    where: { id }
  })
}
