import { FastifyInstance } from "fastify"

import { createResponseSchema } from "@/utils/createResponseSchema"
import {
  displayPostSchema,
  postsQuerySchema,
  createPostBaseSchema,
  updatePostBodySchema,
  queryFlagsSchema,
  postIdParamsSchema,
  reactionSchema,
  reactionParamsSchema,
  createCommentSchema,
  displayCommentSchema,
  authorQuerySchema
} from "./posts.schema"
import {
  getPostsHandler,
  getPostHandler,
  createPostHandler,
  updatePostHandler,
  createOrDeleteReactionHandler,
  deletePostHandler,
  createCommentHandler,
  getPostsOfFollowedUsersHandler
} from "./posts.controller"

async function postsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
        querystring: postsQuerySchema,
        response: {
          200: createResponseSchema(displayPostSchema.array())
        }
      }
    },
    getPostsOfFollowedUsersHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
}

export default postsRoutes
