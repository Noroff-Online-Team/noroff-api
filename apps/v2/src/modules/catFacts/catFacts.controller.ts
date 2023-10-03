import { CatFact } from "@prisma/v2-client"
import { FastifyRequest } from "fastify"
import { NotFound, BadRequest } from "http-errors"
import { catFactParamsSchema } from "./catFacts.schema"
import { sortAndPaginationSchema } from "@noroff/api-utils"

import { getCatFacts, getCatFact, getRandomCatFact } from "./catFacts.service"

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
  try {
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
  } catch (error) {
    throw error
  }
}

export async function getCatFactHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  try {
    const params = catFactParamsSchema.parse(request.params)
    const { id } = params

    const catFact = await getCatFact(id)

    if (!catFact.data) {
      throw new NotFound("No cat fact with such ID")
    }

    return catFact
  } catch (error) {
    throw error
  }
}

export async function getRandomCatFactHandler() {
  try {
    const catFact = await getRandomCatFact()

    if (!catFact.data) {
      throw new NotFound("Couldn't find any cat facts.")
    }

    return catFact
  } catch (error) {
    throw error
  }
}
