import { getRandomNumber } from "@noroff/api-utils"

import { prisma } from "@/utils"

export async function getQuotes() {
  return await prisma.quote.findMany()
}

export async function getQuote(id: number) {
  return await prisma.quote.findUnique({
    where: { id }
  })
}

export async function getRandomQuote() {
  const resultLength = await prisma.quote.count()
  const id = getRandomNumber(1, resultLength)

  return await prisma.quote.findUnique({
    where: { id }
  })
}
