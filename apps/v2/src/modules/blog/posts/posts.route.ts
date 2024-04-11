import { FastifyInstance } from "fastify"
import { createResponseSchema } from "@noroff/api-utils"

import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostsHandler,
  updatePostHandler
} from "./posts.controller"
import {
  createPostBaseSchema,
  displayPostSchema,
  postIdParamsSchema,
  postsQuerySchema,
  queryFlagsSchema,
  updatePostBodySchema
} from "./posts.schema"

async function postsRoutes(server: FastifyInstance) {
  server.get(
    "/:name",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["blog-posts"],
        security: [{ bearerAuth: [] }],
        querystring: postsQuerySchema,
        response: {
          200: createResponseSchema(displayPostSchema.array())
        }
      }
    },
    getPostsHandler
  )

  server.post(
    "/:name",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["blog-posts"],
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
    "/:name/:id",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["blog-posts"],
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
    "/:name/:id",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["blog-posts"],
        security: [{ bearerAuth: [] }],
        params: postIdParamsSchema
      }
    },
    deletePostHandler
  )

  server.get(
    "/:name/:id",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["blog-posts"],
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
}

export default postsRoutes
