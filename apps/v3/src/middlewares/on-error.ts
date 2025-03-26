import env from "@/env"
import * as HttpStatusCodes from "@/helpers/http-status-codes"
import type { ErrorHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import type { StatusCode } from "hono/utils/http-status"
import { isHttpError } from "http-errors"
import statuses from "statuses"
import { ZodError } from "zod"

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  errors: Array<{
    message: string
    code?: string
    path?: Array<string | number>
  }>
  status: string
  statusCode: number
  stack?: string
}

/**
 * Error handler strategy interface
 */
export type ErrorHandlerStrategy = (error: unknown) => {
  statusCode: number
  errors: Array<{
    message: string
    code?: string
    path?: Array<string | number>
  }>
} | null

/**
 * Handles Zod validation errors
 */
export const zodErrorHandler: ErrorHandlerStrategy = error => {
  if (error instanceof ZodError) {
    return {
      statusCode: HttpStatusCodes.BAD_REQUEST,
      errors: error.issues.map(issue => ({
        message: issue.message,
        code: issue.code,
        path: issue.path
      }))
    }
  }
  return null
}

/**
 * Handles HTTP errors from http-errors package
 */
export const httpErrorHandler: ErrorHandlerStrategy = error => {
  if (isHttpError(error)) {
    return {
      statusCode: error.statusCode ?? 500,
      errors: [{ message: error.message }]
    }
  }
  return null
}

/**
 * Handles Hono's HTTPException errors
 */
export const honoErrorHandler: ErrorHandlerStrategy = error => {
  if (error instanceof HTTPException) {
    return {
      statusCode: error.status,
      errors: [{ message: error.message }]
    }
  }
  return null
}

/**
 * Default set of error handlers
 */
export const defaultErrorHandlers: ErrorHandlerStrategy[] = [
  zodErrorHandler,
  httpErrorHandler,
  honoErrorHandler
]

/**
 * Creates an error handler with the specified strategies
 */
export const createErrorHandler = (
  strategies: ErrorHandlerStrategy[] = defaultErrorHandlers
): ErrorHandler => {
  return (err, c) => {
    let handledError = null

    // Try each strategy until one handles the error
    for (const handler of strategies) {
      handledError = handler(err)
      if (handledError) break
    }

    // Default fallback error
    if (!handledError) {
      handledError = {
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        errors: [{ message: "Something went wrong." }]
      }
    }

    // Create the error response
    const errorResponse: ErrorResponse = {
      errors: handledError.errors,
      status: statuses(handledError.statusCode),
      statusCode: handledError.statusCode
    }

    const isDev = env.NODE_ENV === "development"
    if (isDev && err instanceof Error) {
      errorResponse.stack = err.stack
    }

    c.status(handledError.statusCode as StatusCode)
    return c.json(errorResponse)
  }
}

export const onError = createErrorHandler(defaultErrorHandlers)
