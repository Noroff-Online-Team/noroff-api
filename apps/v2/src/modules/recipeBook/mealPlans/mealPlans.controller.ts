import type { MealPlan } from "@prisma/v2-client"
import type { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import type { RequestUser } from "@/types/api"
import { getRecipe } from "../recipes/recipes.service"
import {
  type CreateMealPlanSchema,
  createMealPlanSchema,
  mealPlanParamsSchema,
  mealPlansQuerySchema
} from "./mealPlans.schema"
import {
  createMealPlan,
  deleteMealPlan,
  getMealPlan,
  getMealPlans
} from "./mealPlans.service"

export async function getMealPlansHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof MealPlan
      sortOrder?: "asc" | "desc"
      startDate?: string
      endDate?: string
    }
  }>
) {
  const query = await mealPlansQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query
  const { name } = request.user as RequestUser

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const mealPlans = await getMealPlans(
    name,
    sort,
    sortOrder,
    limit,
    page,
    query.startDate as Date | undefined,
    query.endDate as Date | undefined
  )

  return mealPlans
}

export async function createMealPlanHandler(
  request: FastifyRequest<{
    Body: CreateMealPlanSchema
  }>,
  reply: FastifyReply
) {
  const data = await createMealPlanSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser

  const recipe = await getRecipe(data.recipeId)

  if (!recipe.data) {
    throw new NotFound("No recipe with such ID")
  }

  const mealPlan = await createMealPlan(name, data)

  reply.code(201).send(mealPlan)
}

export async function deleteMealPlanHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { id } = await mealPlanParamsSchema.parseAsync(request.params)
  const { name } = request.user as RequestUser

  const mealPlan = await getMealPlan(id)

  if (!mealPlan.data) {
    throw new NotFound("No meal plan with such ID")
  }

  if (name.toLowerCase() !== mealPlan.data.ownerName.toLowerCase()) {
    throw new Forbidden("You do not have permission to delete this meal plan")
  }

  await deleteMealPlan(id)

  reply.code(204)
}
