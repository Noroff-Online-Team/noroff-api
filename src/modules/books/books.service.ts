import prisma from "../../utils/prisma"
import { getRandomNumber } from "../../utils"

export async function getBooks() {
  return prisma.book.findMany()
}

export async function getBook(id: number) {
  return prisma.book.findUnique({
    where: { id }
  })
}

export async function getRandomBook() {
  const resultLength = await prisma.book.count()
  const id = getRandomNumber(0, resultLength)

  return prisma.book.findUnique({
    where: { id }
  })
}
