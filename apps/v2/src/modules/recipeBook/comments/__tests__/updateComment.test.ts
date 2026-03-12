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
    data: {
      text: "Original comment",
      recipeId: recipe.id,
      ownerName: USER_NAME
    }
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

describe("[PUT] /recipe-book/comments/:id", () => {
  it("should update a comment", async () => {
    const response = await server.inject({
      url: `/recipe-book/comments/${COMMENT_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { text: "Updated comment" }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.text).toBe("Updated comment")
  })

  it("should return 403 when non-owner tries to update", async () => {
    const { bearerToken: otherToken, apiKey: otherKey } =
      await getAuthCredentials({
        name: "other_user",
        email: "other_user@noroff.no"
      })

    const response = await server.inject({
      url: `/recipe-book/comments/${COMMENT_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${otherToken}`,
        "X-Noroff-API-Key": otherKey
      },
      payload: { text: "Hacked" }
    })

    expect(response.statusCode).toBe(403)
  })

  it("should return 404 for non-existent comment", async () => {
    const response = await server.inject({
      url: "/recipe-book/comments/00000000-0000-0000-0000-000000000000",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { text: "Updated" }
    })

    expect(response.statusCode).toBe(404)
  })
})
