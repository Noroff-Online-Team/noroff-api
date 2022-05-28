import { FastifyReply, FastifyRequest } from "fastify"

import { getQuotes, getQuote, getRandomQuote } from "./quotes.service"

export async function getQuotesHandler() {
  const quotes = await getQuotes()
  return quotes
}

export async function getQuoteHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const quote = await getQuote(id)

  if (!quote) {
    const error = new Error("No quote with such ID")
    return reply.code(404).send(error)
  }

  return quote
}

export async function getRandomQuoteHandler() {
  const quote = await getRandomQuote()
  return quote
}
