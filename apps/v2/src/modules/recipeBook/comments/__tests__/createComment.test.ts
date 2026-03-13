import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""
let RECIPE_ID = ""

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
  it("should return 201 when successfully created a comment", async () => {
    const response = await server.inject({
      url: `/recipe-book/recipes/${RECIPE_ID}/comments`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { text: "Great recipe!" }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toMatchObject({
      id: expect.any(String),
      text: "Great recipe!",
      recipeId: RECIPE_ID
    })
  })

  it("should return 404 for non-existent recipe", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes/00000000-0000-0000-0000-000000000000/comments",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { text: "Great recipe!" }
    })

    expect(response.statusCode).toBe(404)
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: `/recipe-book/recipes/${RECIPE_ID}/comments`,
      method: "POST",
      payload: { text: "Great recipe!" }
    })

    expect(response.statusCode).toBe(401)
  })
})
