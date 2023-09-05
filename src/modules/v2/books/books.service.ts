import { Book } from "@prisma-api-v2/client"
import { db, getRandomNumber } from "@/utils"

export async function getBooks(sort: keyof Book = "id", sortOrder: "asc" | "desc" = "asc", limit = 100, page = 1) {
  const [data, meta] = await db.book
    .paginate({
      orderBy: {
        [sort]: sortOrder
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getBook(id: number) {
  const [data, meta] = await db.book
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function getRandomBook() {
  const resultLength = await db.book.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await db.book
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
