import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { Quote } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { quoteParamsSchema } from "./quotes.schema"
import { getQuote, getQuotes, getRandomQuote } from "./quotes.service"

export async function getQuotesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof Quote
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await sortAndPaginationSchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const quotes = await getQuotes(sort, sortOrder, limit, page)

  if (!quotes.data.length) {
    throw new NotFound("Couldn't find any quotes.")
  }

  return quotes
}

export async function getQuoteHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const params = quoteParamsSchema.parse(request.params)
  const { id } = params

  const quote = await getQuote(id)

  if (!quote.data) {
    throw new NotFound("No quote with such ID")
  }

  return quote
}

export async function getRandomQuoteHandler() {
  const quote = await getRandomQuote()

  if (!quote.data) {
    throw new NotFound("Couldn't find any quotes.")
  }

  return quote
}
