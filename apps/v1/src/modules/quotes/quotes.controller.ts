import { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getQuote, getQuotes, getRandomQuote } from "./quotes.service"

export async function getQuotesHandler() {
  const quotes = await getQuotes()
  return quotes
}

export async function getQuoteHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const { id } = request.params
  const quote = await getQuote(id)

  if (!quote) {
    throw new NotFound("No quote with such ID")
  }

  return quote
}

export async function getRandomQuoteHandler() {
  const quote = await getRandomQuote()
  return quote
}
