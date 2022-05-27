import { FastifyRequest } from "fastify"

import { LoginInput } from "./auth.schema"

export async function getTokenHandler(
  request: FastifyRequest<{ Body: LoginInput }>
) {
  const { username } = request.body
  const accessToken = request.jwt.sign({ username })

  return { accessToken }
}
