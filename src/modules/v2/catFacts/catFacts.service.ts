import { prisma, getRandomNumber } from "@/utils"

export async function getCatFacts() {
  const [data, meta] = await prisma.catFact.paginate().withPages({
    limit: 100,
    includePageCount: true
  })

  return { data, meta }
}

export async function getCatFact(id: number) {
  const [data, meta] = await prisma.catFact
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1,
      includePageCount: true
    })

  return { data: data[0], meta }
}

export async function getRandomCatFact() {
  const resultLength = await prisma.catFact.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await prisma.catFact
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1,
      includePageCount: true
    })

  return { data: data[0], meta }
}
