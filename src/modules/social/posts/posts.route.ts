import { FastifyInstance } from "fastify"

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
  createReactionHandler,
  deletePostHandler,
  createCommentHandler
} from "./posts.controller"

async function postsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        querystring: postsQuerySchema,
        response: {
          200: displayPostSchema.array()
        }
      }
    },
    getPostsHandler
  )

  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["posts"],
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
        tags: ["posts"],
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
        tags: ["posts"],
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
        tags: ["posts"],
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
        tags: ["posts"],
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
        tags: ["posts"],
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
