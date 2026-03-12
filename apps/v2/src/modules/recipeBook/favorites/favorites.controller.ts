import type { RecipeFavorite } from "@prisma/v2-client"
import type { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Conflict, NotFound } from "http-errors"

import type { RequestUser } from "@/types/api"
import { getRecipe } from "../recipes/recipes.service"
import {
  type CreateFavoriteSchema,
  createFavoriteSchema,
  favoriteParamsSchema,
  favoritesQuerySchema
} from "./favorites.schema"
import {
  createFavorite,
  deleteFavorite,
  getFavorite,
  getFavorites
} from "./favorites.service"

export async function getFavoritesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof RecipeFavorite
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await favoritesQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query
  const { name } = request.user as RequestUser

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const favorites = await getFavorites(name, sort, sortOrder, limit, page)

  return favorites
}

export async function createFavoriteHandler(
  request: FastifyRequest<{
    Body: CreateFavoriteSchema
  }>,
  reply: FastifyReply
) {
  const { recipeId } = await createFavoriteSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser

  const recipe = await getRecipe(recipeId)

  if (!recipe.data) {
    throw new NotFound("No recipe with such ID")
  }

  const existing = await getFavorite(recipeId, name)

  if (existing.data) {
    throw new Conflict("You have already favorited this recipe")
  }

  const favorite = await createFavorite(recipeId, name)

  reply.code(201).send(favorite)
}

export async function deleteFavoriteHandler(
  request: FastifyRequest<{
    Params: { recipeId: string }
  }>,
  reply: FastifyReply
) {
  const { recipeId } = await favoriteParamsSchema.parseAsync(request.params)
  const { name } = request.user as RequestUser

  const existing = await getFavorite(recipeId, name)

  if (!existing.data) {
    throw new NotFound("No favorite found for this recipe")
  }

  await deleteFavorite(recipeId, name)

  reply.code(204)
}
