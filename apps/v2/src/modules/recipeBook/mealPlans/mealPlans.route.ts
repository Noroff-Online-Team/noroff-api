import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createMealPlanHandler,
  deleteMealPlanHandler,
  getMealPlansHandler
} from "./mealPlans.controller"
import {
  createMealPlanSchema,
  displayMealPlanSchema,
  mealPlanParamsSchema,
  mealPlansQuerySchema
} from "./mealPlans.schema"

async function mealPlansRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-meal-plans"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: mealPlansQuerySchema,
        response: {
          200: createResponseSchema(displayMealPlanSchema.array())
        }
      }
    },
    getMealPlansHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-meal-plans"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createMealPlanSchema,
        response: {
          201: createResponseSchema(displayMealPlanSchema)
        }
      }
    },
    createMealPlanHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["recipe-book-meal-plans"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: mealPlanParamsSchema
      }
    },
    deleteMealPlanHandler
  )
}

export default mealPlansRoutes
