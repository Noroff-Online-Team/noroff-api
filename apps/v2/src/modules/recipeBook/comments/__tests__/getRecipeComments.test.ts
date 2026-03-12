import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let USER_NAME = ""
let RECIPE_ID = ""

beforeEach(async () => {
  const { name } = await getAuthCredentials()
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

  await db.recipeComment.createMany({
    data: [
      { text: "Comment 1", recipeId: RECIPE_ID, ownerName: USER_NAME },
      { text: "Comment 2", recipeId: RECIPE_ID, ownerName: USER_NAME }
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

describe("[GET] /recipe-book/recipes/:recipeId/comments", () => {
  it("should return comments for a recipe", async () => {
    const response = await server.inject({
      url: `/recipe-book/recipes/${RECIPE_ID}/comments`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(2)
  })

  it("should return 404 for non-existent recipe", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes/00000000-0000-0000-0000-000000000000/comments",
      method: "GET"
    })

    expect(response.statusCode).toBe(404)
  })
})
