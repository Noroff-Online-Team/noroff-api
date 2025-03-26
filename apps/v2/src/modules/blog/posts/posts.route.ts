import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

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
  postIdWithNameParamsSchema,
  postsQuerySchema,
  profileNameSchema,
  updatePostBodySchema
} from "./posts.schema"

async function postsRoutes(server: FastifyInstance) {
  server.get(
    "/:name",
    {
      schema: {
        tags: ["blog-posts"],
        params: profileNameSchema,
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
        security: [{ bearerAuth: [], apiKey: [] }],
        params: profileNameSchema,
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
        security: [{ bearerAuth: [], apiKey: [] }],
        params: postIdWithNameParamsSchema,
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
        security: [{ bearerAuth: [], apiKey: [] }],
        params: postIdWithNameParamsSchema
      }
    },
    deletePostHandler
  )

  server.get(
    "/:name/:id",
    {
      schema: {
        tags: ["blog-posts"],
        params: postIdWithNameParamsSchema,
        response: {
          200: createResponseSchema(displayPostSchema)
        }
      }
    },
    getPostHandler
  )
}

export default postsRoutes
