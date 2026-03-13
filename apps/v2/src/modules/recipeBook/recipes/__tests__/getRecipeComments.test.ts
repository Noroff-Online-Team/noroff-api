import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const RECIPE_UUID = "a229424c-da96-4725-b112-4a880cc7f2e1"

let USER_NAME = ""

beforeEach(async () => {
  const { name } = await registerUser()
  USER_NAME = name

  await db.recipe.create({
    data: {
      id: RECIPE_UUID,
      title: "Tomato Soup",
      description: "A simple tomato soup.",
      prepTime: 10,
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      category: "Soup",
      ingredients: [{ name: "Tomatoes", quantity: 6, unit: "pcs" }],
      instructions: ["Simmer ingredients.", "Blend until smooth."],
      tags: ["Comfort food"],
      ownerName: USER_NAME
    }
  })

  await db.recipeComment.createMany({
    data: [
      {
        text: "Perfect for lunch.",
        recipeId: RECIPE_UUID,
        ownerName: USER_NAME
      },
      {
        text: "Adding basil worked well.",
        recipeId: RECIPE_UUID,
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

describe("[GET] /recipe-book/recipes/:id/comments", () => {
  it("should return comments for a recipe from the recipes module", async () => {
    const response = await server.inject({
      url: `/recipe-book/recipes/${RECIPE_UUID}/comments`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(2)
    expect(res.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recipeId: RECIPE_UUID,
          text: "Perfect for lunch.",
          author: expect.objectContaining({
            name: USER_NAME
          })
        }),
        expect.objectContaining({
          recipeId: RECIPE_UUID,
          text: "Adding basil worked well.",
          author: expect.objectContaining({
            name: USER_NAME
          })
        })
      ])
    )
    expect(res.meta).toStrictEqual({})
  })
})
