import { FastifyInstance } from "fastify"

import { $ref } from "./posts.schema"
import {
  getPostsHandler,
  getPostHandler,
  createPostHandler,
  updatePostHandler,
  reactionHandler
} from "./posts.controller"

async function postsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: $ref("displayPostSchema")
          }
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
        body: $ref("createPostBaseSchema"),
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("postSchema")
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
        body: $ref("createPostSchema"),
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("postSchema")
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
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object"
          }
        }
      }
    },
    updatePostHandler
  )

  server.get(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: $ref("displayPostSchema")
        }
      }
    },
    getPostHandler
  )

  server.get(
    "/:id/react/:symbol",
    {
      preHandler: [server.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
            symbol: { type: "string" }
          }
        },
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("reactionSchema")
        }
      }
    },
    reactionHandler
  )
}

export default postsRoutes
