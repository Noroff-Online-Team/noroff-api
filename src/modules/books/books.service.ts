import prisma from "../../utils/prisma"

export async function getBooks() {
  return prisma.book.findMany()
}

export async function getBook(id: number) {
  return prisma.book.findUnique({
    where: { id }
  })
}
