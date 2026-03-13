import { mediaGuard } from "@noroff/api-utils"
import type { Recipe } from "@prisma/v2-client"
import type { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import type { RequestUser } from "@/types/api"
import {
  type CreateRecipeCommentSchema,
  type CreateRecipeSchema,
  type UpdateRecipeSchema,
  createRecipeCommentSchema,
  createRecipeSchema,
  recipeParamsSchema,
  recipesQuerySchema,
  updateRecipeSchema
} from "./recipes.schema"
import {
  createRecipe,
  createRecipeComment,
  deleteRecipe,
  getRecipe,
  getRecipeComments,
  getRecipes,
  updateRecipe
} from "./recipes.service"

export async function getRecipesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof Recipe
      sortOrder?: "asc" | "desc"
      search?: string
      category?: string
      difficulty?: string
    }
  }>
) {
  await recipesQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, search, category, difficulty } =
    request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const recipes = await getRecipes(
    sort,
    sortOrder,
    limit,
    page,
    search,
    category,
    difficulty
  )

  return recipes
}

export async function getRecipeHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = await recipeParamsSchema.parseAsync(request.params)

  const recipe = await getRecipe(id)

  if (!recipe.data) {
    throw new NotFound("No recipe with such ID")
  }

  return recipe
}

export async function createRecipeHandler(
  request: FastifyRequest<{
    Body: CreateRecipeSchema
  }>,
  reply: FastifyReply
) {
  const data = await createRecipeSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser
  const { image } = data

  if (image?.url) {
    await mediaGuard(image.url)
  }

  const recipe = await createRecipe(name, data)

  reply.code(201).send(recipe)
}

export async function updateRecipeHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateRecipeSchema
  }>
) {
  const { id } = await recipeParamsSchema.parseAsync(request.params)
  const data = await updateRecipeSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser
  const { image } = data

  const recipe = await getRecipe(id)

  if (!recipe.data) {
    throw new NotFound("No recipe with such ID")
  }

  if (name.toLowerCase() !== recipe.data.ownerName.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this recipe")
  }

  if (image?.url) {
    await mediaGuard(image.url)
  }

  const updatedRecipe = await updateRecipe(id, data)

  return updatedRecipe
}

export async function deleteRecipeHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { id } = await recipeParamsSchema.parseAsync(request.params)
  const { name } = request.user as RequestUser

  const recipe = await getRecipe(id)

  if (!recipe.data) {
    throw new NotFound("No recipe with such ID")
  }

  if (name.toLowerCase() !== recipe.data.ownerName.toLowerCase()) {
    throw new Forbidden("You do not have permission to delete this recipe")
  }

  await deleteRecipe(id)

  reply.code(204)
}

export async function getRecipeCommentsHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = await recipeParamsSchema.parseAsync(request.params)

  const recipe = await getRecipe(id)

  if (!recipe.data) {
    throw new NotFound("No recipe with such ID")
  }

  const comments = await getRecipeComments(id)

  return comments
}

export async function createRecipeCommentHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: CreateRecipeCommentSchema
  }>,
  reply: FastifyReply
) {
  const { id } = await recipeParamsSchema.parseAsync(request.params)
  const data = await createRecipeCommentSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser

  const recipe = await getRecipe(id)

  if (!recipe.data) {
    throw new NotFound("No recipe with such ID")
  }

  const comment = await createRecipeComment(id, name, data)

  reply.code(201).send(comment)
}
