import { prisma, getRandomNumber } from "@/utils"

export async function getBooks() {
  return await prisma.book.findMany()
}

export async function getBook(id: number) {
  return await prisma.book.findUnique({
    where: { id }
  })
}

export async function getRandomBook() {
  const resultLength = await prisma.book.count()
  const id = getRandomNumber(1, resultLength)

  return await prisma.book.findUnique({
    where: { id }
  })
}
