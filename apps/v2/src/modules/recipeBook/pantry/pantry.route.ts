import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createPantryItemHandler,
  deletePantryItemHandler,
  getPantryItemsHandler,
  updatePantryItemHandler
} from "./pantry.controller"
import {
  createPantryItemSchema,
  displayPantryItemSchema,
  pantryItemParamsSchema,
  pantryItemsQuerySchema,
  updatePantryItemSchema
} from "./pantry.schema"

async function pantryRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-pantry"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: pantryItemsQuerySchema,
        response: {
          200: createResponseSchema(displayPantryItemSchema.array())
        }
      }
    },
    getPantryItemsHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-pantry"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createPantryItemSchema,
        response: {
          201: createResponseSchema(displayPantryItemSchema)
        }
      }
    },
    createPantryItemHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-pantry"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: pantryItemParamsSchema,
        body: updatePantryItemSchema,
        response: {
          200: createResponseSchema(displayPantryItemSchema)
        }
      }
    },
    updatePantryItemHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-pantry"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: pantryItemParamsSchema
      }
    },
    deletePantryItemHandler
  )
}

export default pantryRoutes
