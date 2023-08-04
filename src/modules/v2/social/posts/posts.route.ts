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
  createReactionHandler,
  deletePostHandler,
  createCommentHandler,
  getPostsOfFollowedUsersHandler
} from "./posts.controller"

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
          200: createResponseSchema(displayPostSchema.array())
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
          200: createResponseSchema(displayPostSchema.array())
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
          200: createResponseSchema(displayPostSchema)
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
          200: createResponseSchema(displayPostSchema)
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
          200: createResponseSchema(displayPostSchema)
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
          200: createResponseSchema(reactionSchema)
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
          200: createResponseSchema(displayCommentSchema)
        }
      }
    },
    createCommentHandler
  )
}

export default postsRoutes
