import { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import { getCatFact, getCatFacts, getRandomCatFact } from "./catFacts.service"

export async function getCatFactsHandler() {
  const catFacts = await getCatFacts()
  return catFacts
}

export async function getCatFactHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>
) {
  const { id } = request.params
  const catFact = await getCatFact(id)

  if (!catFact) {
    throw new NotFound("No cat fact with such ID")
  }

  return catFact
}

export async function getRandomCatFactHandler() {
  const catFact = await getRandomCatFact()
  return catFact
}
