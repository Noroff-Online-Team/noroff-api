import { FastifyRequest } from "fastify"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { bookParamsSchema } from "./books.schema"

import { getBooks, getBook, getRandomBook } from "./books.service"

export async function getBooksHandler() {
  try {
    const books = await getBooks()

    if (!books.data.length) {
      throw new NotFound("Couldn't find any books.")
    }

    return books
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
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
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
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
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
