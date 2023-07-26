import { FastifyRequest } from "fastify"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { quoteParamsSchema } from "./quotes.schema"

import { getQuotes, getQuote, getRandomQuote } from "./quotes.service"

export async function getQuotesHandler() {
  try {
    const quotes = await getQuotes()

    if (!quotes.data.length) {
      throw new NotFound("Couldn't find any quotes.")
    }

    return quotes
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getQuoteHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  try {
    const params = quoteParamsSchema.parse(request.params)
    const { id } = params

    const quote = await getQuote(id)

    if (!quote.data) {
      throw new NotFound("No quote with such ID")
    }

    return quote
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

export async function getRandomQuoteHandler() {
  try {
    const quote = await getRandomQuote()

    if (!quote.data) {
      throw new NotFound("Couldn't find any quotes.")
    }

    return quote
  } catch (error) {
    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
