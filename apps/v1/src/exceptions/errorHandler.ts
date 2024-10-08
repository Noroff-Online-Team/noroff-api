import type { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import statuses from "statuses"
import { ZodError, type ZodIssueCode } from "zod"

export default async function (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  interface ParsedError {
    code: ZodIssueCode
    message: string
    path: Array<string | number>
  }

  const statusCode = error?.statusCode || 500
  let errors = [error]

  if (error instanceof ZodError) {
    const parsedErrors = JSON.parse(error?.message).map((err: ParsedError) => ({
      code: err.code,
      message: err.message,
      path: err.path
    }))

    errors = parsedErrors
  }

  if (error.statusCode === 429) {
    reply.code(statusCode).send({
      errors: [
        {
          message: "Too many requests, please try again later"
        }
      ],
      status: statuses(statusCode),
      statusCode
    })
  }

  if (error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER") {
    reply.code(statusCode).send({
      errors: [
        {
          message: "No authorization header was found"
        }
      ],
      status: statuses(statusCode),
      statusCode
    })
  }

  reply.code(statusCode).send({
    errors,
    status: statuses(statusCode),
    statusCode
  })
}
