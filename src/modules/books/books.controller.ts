import { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getBooks, getBook, getRandomBook } from "./books.service"

export async function getBooksHandler() {
  const books = await getBooks()
  return books
}

export async function getBookHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const { id } = request.params
  const book = await getBook(id)

  if (!book) {
    throw new NotFound("No book with such ID")
  }

  return book
}

export async function getRandomBookHandler() {
  const book = await getRandomBook()
  return book
}
