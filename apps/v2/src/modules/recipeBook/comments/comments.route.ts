import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  deleteCommentHandler,
  updateCommentHandler
} from "./comments.controller"
import {
  commentParamsSchema,
  displayCommentSchema,
  updateCommentSchema
} from "./comments.schema"

async function commentsRoutes(server: FastifyInstance) {
  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-comments"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: commentParamsSchema,
        body: updateCommentSchema,
        response: {
          200: createResponseSchema(displayCommentSchema)
        }
      }
    },
    updateCommentHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-comments"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: commentParamsSchema
      }
    },
    deleteCommentHandler
  )
}

export default commentsRoutes
