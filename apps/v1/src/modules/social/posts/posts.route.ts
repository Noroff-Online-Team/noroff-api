import { FastifyInstance } from "fastify"

import {
  createCommentHandler,
  createPostHandler,
  createReactionHandler,
  deletePostHandler,
  getPostHandler,
  getPostsHandler,
  getPostsOfFollowedUsersHandler,
  updatePostHandler
} from "./posts.controller"
import {
  authorQuerySchema,
  createCommentSchema,
  createPostBaseSchema,
  displayCommentSchema,
  displayPostSchema,
  postIdParamsSchema,
  postsQuerySchema,
  queryFlagsSchema,
  reactionParamsSchema,
  reactionSchema,
  updatePostBodySchema
} from "./posts.schema"

async function postsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
        querystring: postsQuerySchema,
        response: {
          200: displayPostSchema.array()
        }
      }
    },
    getPostsHandler
  )

  server.get(
    "/following",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
        querystring: postsQuerySchema,
        response: {
          200: displayPostSchema.array()
        }
      }
    },
    getPostsOfFollowedUsersHandler
  )

  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        body: createPostBaseSchema,
        response: {
          200: displayPostSchema
        }
      }
    },
    createPostHandler
  )

  server.put(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: postIdParamsSchema,
        body: updatePostBodySchema,
        response: {
          200: displayPostSchema
        }
      }
    },
    updatePostHandler
  )

  server.delete(
    "/:id",
    {
      preHandler: [server.authenticate],
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
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: postIdParamsSchema,
        response: {
          200: displayPostSchema
        }
      }
    },
    getPostHandler
  )

  server.put(
    "/:id/react/:symbol",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: reactionParamsSchema,
        response: {
          200: reactionSchema
        }
      }
    },
    createReactionHandler
  )

  server.post(
    "/:id/comment",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-posts"],
        security: [{ bearerAuth: [] }],
        querystring: authorQuerySchema,
        params: postIdParamsSchema,
        body: createCommentSchema,
        response: {
          200: displayCommentSchema
        }
      }
    },
    createCommentHandler
  )
}

export default postsRoutes
