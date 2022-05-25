import prisma from "../../utils/prisma"

export async function getCatFacts() {
  return prisma.catFact.findMany()
}

export async function getCatFact(id: number) {
  return prisma.catFact.findUnique({
    where: { id }
  })
}
