import type { MealPlan } from "@prisma/v2-client"

import { db } from "@/utils"
import type { CreateMealPlanSchema } from "./mealPlans.schema"

const mealPlanIncludes = {
  recipe: {
    include: {
      image: true,
      owner: { include: { avatar: true, banner: true } }
    }
  },
  owner: { include: { avatar: true, banner: true } }
}

export async function getMealPlans(
  ownerName: string,
  sort: keyof MealPlan = "date",
  sortOrder: "asc" | "desc" = "asc",
  limit = 100,
  page = 1,
  startDate?: Date,
  endDate?: Date
) {
  const where: Record<string, unknown> = { ownerName }

  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.gte = startDate
    if (endDate) dateFilter.lte = endDate
    where.date = dateFilter
  }

  const [data, meta] = await db.mealPlan
    .paginate({
      where,
      orderBy: {
        [sort]: sortOrder
      },
      include: mealPlanIncludes
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getMealPlan(id: string) {
  const data = await db.mealPlan.findUnique({
    where: { id },
    include: mealPlanIncludes
  })

  return { data }
}

export async function createMealPlan(
  ownerName: string,
  createData: CreateMealPlanSchema
) {
  const data = await db.mealPlan.create({
    data: {
      ...createData,
      ownerName
    },
    include: mealPlanIncludes
  })

  return { data }
}

export async function deleteMealPlan(id: string) {
  await db.mealPlan.delete({
    where: { id }
  })
}
