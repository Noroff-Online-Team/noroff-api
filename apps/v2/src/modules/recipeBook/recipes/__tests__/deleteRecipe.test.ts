import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const RECIPE_UUID = "a229424c-da96-4725-b112-4a880cc7f2e0"

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name

  await db.recipe.create({
    data: {
      id: RECIPE_UUID,
      title: "Spaghetti Carbonara",
      description: "Classic Italian pasta.",
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: "Medium",
      category: "Pasta",
      ingredients: [{ name: "Spaghetti", quantity: 400, unit: "g" }],
      instructions: ["Cook pasta.", "Add sauce."],
      tags: ["Italian"],
      ownerName: USER_NAME
    }
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

describe("[DELETE] /recipe-book/recipes/:id", () => {
  it("should delete a recipe", async () => {
    const response = await server.inject({
      url: `/recipe-book/recipes/${RECIPE_UUID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await server.inject({
      url: `/recipe-book/recipes/${RECIPE_UUID}`,
      method: "GET"
    })
    expect(getResponse.statusCode).toBe(404)
  })

  it("should return 404 for non-existent recipe", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes/00000000-0000-0000-0000-000000000000",
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
      url: `/recipe-book/recipes/${RECIPE_UUID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${otherToken}`,
        "X-Noroff-API-Key": otherKey
      }
    })

    expect(response.statusCode).toBe(403)
  })
})
