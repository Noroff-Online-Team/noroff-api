import { getRandomNumber } from "@noroff/api-utils"
import { Book } from "@prisma/v2-client"

import { db } from "@/utils"

export async function getBooks(sort: keyof Book = "id", sortOrder: "asc" | "desc" = "asc", limit = 100, page = 1) {
  const [data, meta] = await db.book
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        image: true
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getBook(id: number) {
  const [data] = await db.book
    .paginate({
      where: { id },
      include: {
        image: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function getRandomBook() {
  const resultLength = await db.book.count()
  const id = getRandomNumber(1, resultLength)

  const [data] = await db.book
    .paginate({
      where: { id },
      include: {
        image: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}
