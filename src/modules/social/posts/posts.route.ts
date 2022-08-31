import { FastifyInstance } from "fastify"

import { $ref } from "./posts.schema"
import {
  getPostsHandler,
  getPostHandler,
  createPostHandler,
  updatePostHandler
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
            items: $ref("postSchema")
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
        body: {
          type: "object",
          required: ["title", "body"],
          properties: {
            title: { type: "string" },
            body: { type: "string" },
            media: { type: "string" },
            tags: { type: "array" },
            userId: { type: "number" }
          }
        },
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
        body: {
          type: "object",
          required: ["title", "body"],
          properties: {
            title: { type: "string" },
            body: { type: "string" },
            media: { type: "string" },
            tags: { type: "array" }
          }
        },
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("postSchema")
        }
      }
    },
    updatePostHandler
  )

  server.get(
    "/:id",
    {
      // preHandler: [server.authenticate],
      schema: {
        tags: ["posts"],
        // security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: $ref("postSchema")
        }
      }
    },
    getPostHandler
  )
}

export default postsRoutes
