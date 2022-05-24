import { FastifyReply, FastifyRequest } from "fastify"

import { getCatFacts, getCatFact } from "./catFacts.service"

export async function getCatFactsHandler() {
  const catFacts = await getCatFacts()
  return catFacts
}

export async function getCatFactHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const catFact = await getCatFact(id)

  if (!catFact) {
    const error = new Error("No cat fact with such ID")
    return reply.code(404).send(error)
  }

  return catFact
}
