import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

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

  await db.mealPlan.createMany({
    data: [
      {
        recipeId: recipe.id,
        date: new Date("2026-03-15"),
        mealType: "Breakfast",
        ownerName: USER_NAME
      },
      {
        recipeId: recipe.id,
        date: new Date("2026-03-16"),
        mealType: "Dinner",
        ownerName: USER_NAME
      }
    ]
  })
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

describe("[GET] /recipe-book/meal-plans", () => {
  it("should return user's meal plans", async () => {
    const response = await server.inject({
      url: "/recipe-book/meal-plans",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(2)
  })

  it("should filter by date range", async () => {
    const response = await server.inject({
      url: "/recipe-book/meal-plans?startDate=2026-03-15&endDate=2026-03-15",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(1)
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/recipe-book/meal-plans",
      method: "GET"
    })

    expect(response.statusCode).toBe(401)
  })
})
