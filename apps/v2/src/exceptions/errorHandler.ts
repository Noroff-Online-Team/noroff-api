import type { FastifyError, FastifyRequest, FastifyReply } from "fastify"
import { ZodError, ZodIssueCode } from "zod"
import statuses from "statuses"

export default async function (error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  interface ParsedError {
    code: ZodIssueCode
    message: string
    path: Array<string | number>
  }

  const statusCode = error?.statusCode || 500
  let errors = [error] || "Something went wrong"

  if (error instanceof ZodError) {
    const parsedErrors = JSON.parse(error?.message).map((err: ParsedError) => ({
      code: err.code,
      message: err.message,
      path: err.path
    }))

    errors = parsedErrors
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
