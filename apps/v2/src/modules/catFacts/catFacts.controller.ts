import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { CatFact } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { catFactParamsSchema } from "./catFacts.schema"
import { getCatFact, getCatFacts, getRandomCatFact } from "./catFacts.service"

export async function getCatFactsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof CatFact
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await sortAndPaginationSchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const catFacts = await getCatFacts(sort, sortOrder, limit, page)

  if (!catFacts.data.length) {
    throw new NotFound("Couldn't find any cat facts.")
  }

  return catFacts
}

export async function getCatFactHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const params = catFactParamsSchema.parse(request.params)
  const { id } = params

  const catFact = await getCatFact(id)

  if (!catFact.data) {
    throw new NotFound("No cat fact with such ID")
  }

  return catFact
}

export async function getRandomCatFactHandler() {
  const catFact = await getRandomCatFact()

  if (!catFact.data) {
    throw new NotFound("Couldn't find any cat facts.")
  }

  return catFact
}
