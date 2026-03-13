import type { Recipe } from "@prisma/v2-client"

import { db } from "@/utils"
import type {
  CreateRecipeCommentSchema,
  CreateRecipeSchema,
  UpdateRecipeSchema
} from "./recipes.schema"

const recipeIncludes = {
  image: true,
  owner: { include: { avatar: true, banner: true } },
  comments: {
    include: {
      author: { include: { avatar: true, banner: true } }
    },
    orderBy: { created: "desc" as const }
  },
  _count: {
    select: { favorites: true }
  }
}

export async function getRecipes(
  sort: keyof Recipe = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  search?: string,
  category?: string,
  difficulty?: string
) {
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ]
  }
  if (category) {
    where.category = { equals: category, mode: "insensitive" }
  }
  if (difficulty) {
    where.difficulty = { equals: difficulty, mode: "insensitive" }
  }

  const [data, meta] = await db.recipe
    .paginate({
      where,
      orderBy: {
        [sort]: sortOrder
      },
      include: recipeIncludes
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getRecipe(id: string) {
  const [data] = await db.recipe
    .paginate({
      where: { id },
      include: recipeIncludes
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function createRecipe(
  ownerName: string,
  createData: CreateRecipeSchema
) {
  const { image, ...restData } = createData

  const data = await db.recipe.create({
    data: {
      ...restData,
      ownerName,
      image: image?.url ? { create: image } : undefined
    },
    include: recipeIncludes
  })

  return { data }
}

export async function updateRecipe(id: string, updateData: UpdateRecipeSchema) {
  const { image, ...restData } = updateData

  const data = await db.recipe.update({
    where: { id },
    data: {
      ...restData,
      image: image?.url ? { delete: {}, create: image } : undefined
    },
    include: recipeIncludes
  })

  return { data }
}

export async function deleteRecipe(id: string) {
  await db.recipe.delete({
    where: { id }
  })
}

export async function getRecipeComments(recipeId: string) {
  const data = await db.recipeComment.findMany({
    where: { recipeId },
    include: {
      author: { include: { avatar: true, banner: true } }
    },
    orderBy: { created: "desc" }
  })

  return { data }
}

export async function createRecipeComment(
  recipeId: string,
  ownerName: string,
  createData: CreateRecipeCommentSchema
) {
  const data = await db.recipeComment.create({
    data: {
      ...createData,
      recipeId,
      ownerName
    },
    include: {
      author: { include: { avatar: true, banner: true } }
    }
  })

  return { data }
}
