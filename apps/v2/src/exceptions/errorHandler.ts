import type { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import { Prisma } from "@prisma/v2-client"
import { isHttpError } from "http-errors"
import statuses from "statuses"
import { ZodError, ZodIssueCode } from "zod"

type ErrorHandlerStrategy = (error: FastifyError) => {
  statusCode: number
  errors: Array<{ message: string; code?: ZodIssueCode; path?: Array<string | number> }>
} | null

interface ErrorResponse {
  errors: Array<{ message: string; code?: ZodIssueCode; path?: Array<string | number> }>
  status: string
  statusCode: number
}

const zodErrorHandler: ErrorHandlerStrategy = error => {
  if (error instanceof ZodError) {
    return {
      statusCode: error.statusCode ?? 400,
      errors: error.issues.map(issue => ({
        message: issue.message,
        code: issue.code,
        path: issue.path
      }))
    }
  }
  return null
}

const httpErrorHandler: ErrorHandlerStrategy = error => {
  if (isHttpError(error)) {
    return {
      statusCode: error.statusCode ?? 500,
      errors: [{ message: error.message }]
    }
  }
  return null
}

const jwtErrorHandler: ErrorHandlerStrategy = error => {
  if (error.code.startsWith("FST_JWT")) {
    let statusCode: number
    let customMessage: string

    switch (error.code) {
      case "FST_JWT_NO_AUTHORIZATION_IN_HEADER":
        statusCode = 401
        customMessage = "No authorization header was found"
        break
      case "FST_JWT_AUTHORIZATION_TOKEN_INVALID":
        statusCode = 401
        customMessage = "Invalid authorization token. Please login again"
        break
      case "FST_JWT_BAD_REQUEST":
        statusCode = 400
        customMessage = "Bad format in request authorization header. Correct format is Authorization: Bearer [token]"
        break
      default:
        statusCode = 401
        customMessage = "Invalid authorization header"
    }

    return {
      statusCode,
      errors: [{ message: customMessage }]
    }
  }
  return null
}

const rateLimitErrorHandler: ErrorHandlerStrategy = error => {
  if (error.statusCode === 429) {
    return {
      statusCode: error.statusCode ?? 429,
      errors: [{ message: "Too many requests, please try again later" }]
    }
  }
  return null
}

// We can add additional handling for the different Prisma error codes.
// https://www.prisma.io/docs/reference/api-reference/error-reference
const prismaErrorHandler: ErrorHandlerStrategy = error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode: number
    let customMessage: string

    // P2001, P2002 should in reality not happen as we handle these in the controllers and with cascade deletes, but we'll keep them here just in case.
    switch (error.code) {
      case "P2001": // Record does not exist
        statusCode = 404
        customMessage = "This resource does not exist."
        break
      case "P2002": // Unique constraint failed
        statusCode = 409
        customMessage = "This resource already exists."
        break
      case "P2003": // A constraint failed
        statusCode = 400
        customMessage = "A constraint failed."
        break
      case "P2010": // Missing a required value
        statusCode = 400
        customMessage = "You are missing a required value."
        break
      default:
        statusCode = 400
        customMessage = "A Prisma error occurred."
      // TODO: Add logging in default with error.code for debugging.
    }

    return {
      statusCode,
      errors: [{ message: customMessage }]
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return {
      statusCode: 500,
      errors: [{ message: "An unknown database error occurred." }]
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      statusCode: 500,
      errors: [{ message: "Database initialization failed. Is the database running?" }]
    }
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      statusCode: 500,
      errors: [{ message: "A critical error occurred in the database engine." }]
    }
  }
  return null
}

const errorHandlers: ErrorHandlerStrategy[] = [
  zodErrorHandler,
  httpErrorHandler,
  jwtErrorHandler,
  rateLimitErrorHandler,
  prismaErrorHandler
]

export default async function (error: FastifyError, request: FastifyRequest, reply: FastifyReply): Promise<void> {
  let handledError = null

  for (const handler of errorHandlers) {
    handledError = handler(error)
    if (handledError) break
  }

  if (!handledError) {
    handledError = {
      statusCode: 500,
      errors: [{ message: "Something went wrong." }]
    }
  }

  const errorResponse: ErrorResponse = {
    errors: handledError.errors,
    status: statuses(handledError.statusCode) as string,
    statusCode: handledError.statusCode
  }

  reply.code(handledError.statusCode).send(errorResponse)
}
