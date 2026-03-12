import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""
let MEAL_PLAN_ID = ""

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name

  const recipe = await db.recipe.create({
    data: {
      title: "Test Recipe",
      description: "A test recipe.",
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      difficulty: "Easy",
      category: "Test",
      ingredients: [{ name: "Test", quantity: 1, unit: "piece" }],
      instructions: ["Do the test."],
      tags: [],
      ownerName: USER_NAME
    }
  })

  const mealPlan = await db.mealPlan.create({
    data: {
      recipeId: recipe.id,
      date: new Date("2026-03-15"),
      mealType: "Dinner",
      ownerName: USER_NAME
    }
  })
  MEAL_PLAN_ID = mealPlan.id
})

afterEach(async () => {
  const mealPlans = db.mealPlan.deleteMany()
  const favorites = db.recipeFavorite.deleteMany()
  const comments = db.recipeComment.deleteMany()
  const recipes = db.recipe.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([mealPlans, favorites, comments, recipes, users, media])
  await db.$disconnect()
})

describe("[DELETE] /recipe-book/meal-plans/:id", () => {
  it("should delete a meal plan", async () => {
    const response = await server.inject({
      url: `/recipe-book/meal-plans/${MEAL_PLAN_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)
  })

  it("should return 404 for non-existent meal plan", async () => {
    const response = await server.inject({
      url: "/recipe-book/meal-plans/00000000-0000-0000-0000-000000000000",
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(404)
  })

  it("should return 403 when non-owner tries to delete", async () => {
    const { bearerToken: otherToken, apiKey: otherKey } =
      await getAuthCredentials({
        name: "other_user",
        email: "other_user@noroff.no"
      })

    const response = await server.inject({
      url: `/recipe-book/meal-plans/${MEAL_PLAN_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${otherToken}`,
        "X-Noroff-API-Key": otherKey
      }
    })

    expect(response.statusCode).toBe(403)
  })
})
