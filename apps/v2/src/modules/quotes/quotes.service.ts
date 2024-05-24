import { getRandomNumber } from "@noroff/api-utils"
import { Quote } from "@prisma/v2-client"

import { db } from "@/utils"

export async function getQuotes(sort: keyof Quote = "id", sortOrder: "asc" | "desc" = "asc", limit = 100, page = 1) {
  const [data, meta] = await db.quote
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

export async function getQuote(id: number) {
  const [data] = await db.quote
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function getRandomQuote() {
  const resultLength = await db.quote.count()
  const id = getRandomNumber(1, resultLength)

  const [data] = await db.quote
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}
