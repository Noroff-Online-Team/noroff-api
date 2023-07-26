import { prisma, getRandomNumber } from "@/utils"

export async function getBooks() {
  const [data, meta] = await prisma.book.paginate().withPages({
    limit: 100,
    includePageCount: true
  })

  return { data, meta }
}

export async function getBook(id: number) {
  const [data, meta] = await prisma.book
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1,
      includePageCount: true
    })

  return { data: data[0], meta }
}

export async function getRandomBook() {
  const resultLength = await prisma.book.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await prisma.book
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1,
      includePageCount: true
    })

  return { data: data[0], meta }
}
