import { FastifyReply, FastifyRequest } from "fastify"

import { getBooks, getBook, getRandomBook } from "./books.service"

export async function getBooksHandler() {
  const books = await getBooks()
  return books
}

export async function getBookHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const book = await getBook(id)

  if (!book) {
    const error = new Error("No book with such ID")
    return reply.code(404).send(error)
  }

  return book
}

export async function getRandomBookHandler() {
  const book = await getRandomBook()
  return book
}
