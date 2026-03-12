import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createRecipeCommentHandler,
  createRecipeHandler,
  deleteRecipeHandler,
  getRecipeCommentsHandler,
  getRecipeHandler,
  getRecipesHandler,
  updateRecipeHandler
} from "./recipes.controller"
import {
  createRecipeCommentSchema,
  createRecipeSchema,
  displayRecipeCommentSchema,
  displayRecipeSchema,
  recipeParamsSchema,
  recipesQuerySchema,
  updateRecipeSchema
} from "./recipes.schema"

async function recipesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["recipe-book-recipes"],
        querystring: recipesQuerySchema,
        response: {
          200: createResponseSchema(displayRecipeSchema.array())
        }
      }
    },
    getRecipesHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["recipe-book-recipes"],
        params: recipeParamsSchema,
        response: {
          200: createResponseSchema(displayRecipeSchema)
        }
      }
    },
    getRecipeHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-recipes"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createRecipeSchema,
        response: {
          201: createResponseSchema(displayRecipeSchema)
        }
      }
    },
    createRecipeHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-recipes"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: recipeParamsSchema,
        body: updateRecipeSchema,
        response: {
          200: createResponseSchema(displayRecipeSchema)
        }
      }
    },
    updateRecipeHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-recipes"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: recipeParamsSchema
      }
    },
    deleteRecipeHandler
  )

  server.get(
    "/:recipeId/comments",
    {
      schema: {
        tags: ["recipe-book-recipes"],
        response: {
          200: createResponseSchema(displayRecipeCommentSchema.array())
        }
      }
    },
    getRecipeCommentsHandler
  )

  server.post(
    "/:recipeId/comments",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-recipes"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createRecipeCommentSchema,
        response: {
          201: createResponseSchema(displayRecipeCommentSchema)
        }
      }
    },
    createRecipeCommentHandler
  )
}

export default recipesRoutes
