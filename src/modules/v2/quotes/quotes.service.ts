import { prisma, getRandomNumber } from "@/utils"

export async function getQuotes() {
  const [data, meta] = await prisma.quote.paginate().withPages({
    limit: 100,
    includePageCount: true
  })

  return { data, meta }
}

export async function getQuote(id: number) {
  const [data, meta] = await prisma.quote
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1,
      includePageCount: true
    })

  return { data: data[0], meta }
}

export async function getRandomQuote() {
  const resultLength = await prisma.quote.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await prisma.quote
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1,
      includePageCount: true
    })

  return { data: data[0], meta }
}
