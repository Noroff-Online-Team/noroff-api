import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""
let COMMENT_ID = ""

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

  const comment = await db.recipeComment.create({
    data: { text: "A comment", recipeId: recipe.id, ownerName: USER_NAME }
  })
  COMMENT_ID = comment.id
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

describe("[DELETE] /recipe-book/comments/:id", () => {
  it("should delete a comment", async () => {
    const response = await server.inject({
      url: `/recipe-book/comments/${COMMENT_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)
  })

  it("should return 404 for non-existent comment", async () => {
    const response = await server.inject({
      url: "/recipe-book/comments/00000000-0000-0000-0000-000000000000",
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(404)
  })
})
