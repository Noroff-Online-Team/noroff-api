import { FastifyInstance } from "fastify"

import { $ref } from "./posts.schema"
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
        querystring: {
          type: "object",
          properties: {
            sort: { type: "string" },
            sortOrder: { type: "string" },
            limit: { type: "number" },
            offset: { type: "number" },
            _author: { type: "boolean" },
            _reactions: { type: "boolean" },
            _comments: { type: "boolean" }
          }
        },
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
        querystring: {
          type: "object",
          properties: {
            _author: { type: "boolean" },
            _reactions: { type: "boolean" },
            _comments: { type: "boolean" }
          }
        },
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
        querystring: {
          type: "object",
          properties: {
            _author: { type: "boolean" },
            _reactions: { type: "boolean" },
            _comments: { type: "boolean" }
          }
        },
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        body: $ref("createPostBaseSchema"),
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
        querystring: {
          type: "object",
          properties: {
            _author: { type: "boolean" },
            _reactions: { type: "boolean" },
            _comments: { type: "boolean" }
          }
        },
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

  server.put(
    "/:id/react/:symbol",
    {
      preHandler: [server.authenticate],
      schema: {
        querystring: {
          type: "object",
          properties: {
            _author: { type: "boolean" },
            _reactions: { type: "boolean" },
            _comments: { type: "boolean" }
          }
        },
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
    createReactionHandler
  )

  server.post(
    "/:id/comment/",
    {
      preHandler: [server.authenticate],
      schema: {
        querystring: {
          type: "object",
          properties: {
            _author: { type: "boolean" },
          }
        },
        params: {
          type: "object",
          properties: {
            id: { type: "integer" }
          }
        },
        body: $ref("createCommentSchema"),
        tags: ["posts"],
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("displayCommentSchema")
        }
      }
    },
    createCommentHandler
  )
}

export default postsRoutes
