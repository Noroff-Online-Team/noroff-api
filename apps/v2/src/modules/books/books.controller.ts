import { FastifyRequest } from "fastify"
import { Book } from "@prisma/v2-client"
import { NotFound, BadRequest } from "http-errors"
import { bookParamsSchema } from "./books.schema"
import { sortAndPaginationSchema } from "@noroff/api-utils"

import { getBooks, getBook, getRandomBook } from "./books.service"

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
  try {
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
  } catch (error) {
    throw error
  }
}

export async function getBookHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  try {
    const params = bookParamsSchema.parse(request.params)
    const { id } = params

    const book = await getBook(id)

    if (!book.data) {
      throw new NotFound("No book with such ID")
    }

    return book
  } catch (error) {
    throw error
  }
}

export async function getRandomBookHandler() {
  try {
    const book = await getRandomBook()

    if (!book.data) {
      throw new NotFound("Couldn't find any books.")
    }

    return book
  } catch (error) {
    throw error
  }
}
