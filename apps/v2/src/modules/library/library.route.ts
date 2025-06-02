import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createLibraryBookHandler,
  createLibraryBookReviewHandler,
  deleteLibraryBookHandler,
  deleteLibraryBookReviewHandler,
  getLibraryBookHandler,
  getLibraryBooksHandler,
  updateLibraryBookHandler,
  updateLibraryBookReviewHandler
} from "./library.controller"
import {
  createLibraryBookReviewSchema,
  createLibraryBookSchema,
  displayLibraryBookReviewSchema,
  displayLibraryBookSchema,
  libraryBookParamsSchema,
  libraryBookReviewParamsSchema,
  libraryBooksQuerySchema,
  updateLibraryBookReviewSchema,
  updateLibraryBookSchema
} from "./library.schema"

async function libraryBooksRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["library-books"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: libraryBooksQuerySchema,
        response: {
          200: createResponseSchema(displayLibraryBookSchema.array())
        }
      }
    },
    getLibraryBooksHandler
  )

  server.get(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["library-books"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: libraryBookParamsSchema,
        response: {
          200: createResponseSchema(displayLibraryBookSchema)
        }
      }
    },
    getLibraryBookHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["library-books"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createLibraryBookSchema,
        response: {
          201: createResponseSchema(displayLibraryBookSchema)
        }
      }
    },
    createLibraryBookHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["library-books"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: libraryBookParamsSchema,
        body: updateLibraryBookSchema,
        response: {
          200: createResponseSchema(displayLibraryBookSchema)
        }
      }
    },
    updateLibraryBookHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["library-books"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: libraryBookParamsSchema
      }
    },
    deleteLibraryBookHandler
  )

  server.post(
    "/:id/reviews",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["library-books"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: libraryBookParamsSchema,
        body: createLibraryBookReviewSchema,
        response: {
          201: createResponseSchema(displayLibraryBookReviewSchema)
        }
      }
    },
    createLibraryBookReviewHandler
  )

  server.put(
    "/:id/reviews/:reviewId",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["library-books"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: libraryBookReviewParamsSchema,
        body: updateLibraryBookReviewSchema,
        response: {
          200: createResponseSchema(displayLibraryBookReviewSchema)
        }
      }
    },
    updateLibraryBookReviewHandler
  )

  server.delete(
    "/:id/reviews/:reviewId",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["library-books"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: libraryBookReviewParamsSchema
      }
    },
    deleteLibraryBookReviewHandler
  )
}

export default libraryBooksRoutes
