import { db, getRandomNumber } from "@/utils"

export async function getQuotes() {
  const [data, meta] = await db.quote.paginate().withPages()

  return { data, meta }
}

export async function getQuote(id: number) {
  const [data, meta] = await db.quote
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function getRandomQuote() {
  const resultLength = await db.quote.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await db.quote
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
