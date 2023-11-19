import type { FastifyReply, FastifyRequest } from "fastify"
import statuses from "statuses"

export default async function (request: FastifyRequest, reply: FastifyReply) {
  const { url, method } = request.raw
  const statusCode = 404

  reply.code(statusCode).send({
    errors: [{ message: `Route ${method}:${url} not found` }],
    status: statuses(statusCode),
    statusCode
  })
}
