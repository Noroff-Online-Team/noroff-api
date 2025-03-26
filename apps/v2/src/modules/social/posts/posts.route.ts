import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createCommentHandler,
  createOrDeleteReactionHandler,
  createPostHandler,
  deleteCommentHandler,
  deletePostHandler,
  getPostHandler,
  getPostsHandler,
  getPostsOfFollowedUsersHandler,
  searchPostsHandler,
  updatePostHandler
} from "./posts.controller"
import {
  authorQuerySchema,
  createCommentSchema,
  createPostBaseSchema,
  deleteCommentSchema,
  displayCommentSchema,
  displayPostSchema,
  postIdParamsSchema,
  postsQuerySchema,
  queryFlagsSchema,
  reactionParamsSchema,
  reactionSchema,
  searchQuerySchema,
  updatePostBodySchema
} from "./posts.schema"

async function postsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: postsQuerySchema,
        response: {
          200: createResponseSchema(displayPostSchema.array())
        }
      }
    },
    getPostsHandler
  )

  server.get(
    "/following",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: postsQuerySchema,
        response: {
          200: createResponseSchema(displayPostSchema.array())
        }
      }
    },
    getPostsOfFollowedUsersHandler
  )

  server.get(
    "/search",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        querystring: searchQuerySchema,
        response: {
          200: createResponseSchema(displayPostSchema.array())
        }
      }
    },
    searchPostsHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: queryFlagsSchema,
        body: createPostBaseSchema,
        response: {
          201: createResponseSchema(displayPostSchema)
        }
      }
    },
    createPostHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: queryFlagsSchema,
        params: postIdParamsSchema,
        body: updatePostBodySchema,
        response: {
          200: createResponseSchema(displayPostSchema)
        }
      }
    },
    updatePostHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        params: postIdParamsSchema,
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }]
      }
    },
    deletePostHandler
  )

  server.get(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: queryFlagsSchema,
        params: postIdParamsSchema,
        response: {
          200: createResponseSchema(displayPostSchema)
        }
      }
    },
    getPostHandler
  )

  server.put(
    "/:id/react/:symbol",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: reactionParamsSchema,
        response: {
          200: createResponseSchema(reactionSchema)
        }
      }
    },
    createOrDeleteReactionHandler
  )

  server.post(
    "/:id/comment",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: authorQuerySchema,
        params: postIdParamsSchema,
        body: createCommentSchema,
        response: {
          201: createResponseSchema(displayCommentSchema)
        }
      }
    },
    createCommentHandler
  )

  server.delete(
    "/:id/comment/:commentId",
    {
      preHandler: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: deleteCommentSchema
      }
    },
    deleteCommentHandler
  )
}

export default postsRoutes
