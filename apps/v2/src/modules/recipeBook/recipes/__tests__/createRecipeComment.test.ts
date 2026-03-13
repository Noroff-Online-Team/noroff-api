import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let API_KEY = ""
let BEARER_TOKEN = ""
let RECIPE_ID = ""
let USER_NAME = ""

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name

  const recipe = await db.recipe.create({
    data: {
      title: "Roasted Vegetables",
      description: "A tray of roasted vegetables.",
      prepTime: 15,
      cookTime: 35,
      servings: 4,
      difficulty: "Easy",
      category: "Dinner",
      ingredients: [{ name: "Carrots", quantity: 4, unit: "pcs" }],
      instructions: ["Chop vegetables.", "Roast until tender."],
      tags: ["Vegetarian"],
      ownerName: USER_NAME
    }
  })

  RECIPE_ID = recipe.id
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

describe("[POST] /recipe-book/recipes/:id/comments", () => {
  it("should create a recipe comment from the recipes module", async () => {
    const response = await server.inject({
      url: `/recipe-book/recipes/${RECIPE_ID}/comments`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { text: "This turned out great." }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toMatchObject({
      id: expect.any(String),
      recipeId: RECIPE_ID,
      text: "This turned out great.",
      author: {
        name: USER_NAME
      }
    })
    expect(res.meta).toStrictEqual({})
  })
})
