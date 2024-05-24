import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { Book } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { bookParamsSchema } from "./books.schema"
import { getBook, getBooks, getRandomBook } from "./books.service"

export async function getBooksHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof Book
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await sortAndPaginationSchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const books = await getBooks(sort, sortOrder, limit, page)

  if (!books.data.length) {
    throw new NotFound("Couldn't find any books.")
  }

  return books
}

export async function getBookHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const params = bookParamsSchema.parse(request.params)
  const { id } = params

  const book = await getBook(id)

  if (!book.data) {
    throw new NotFound("No book with such ID")
  }

  return book
}

export async function getRandomBookHandler() {
  const book = await getRandomBook()

  if (!book.data) {
    throw new NotFound("Couldn't find any books.")
  }

  return book
}
