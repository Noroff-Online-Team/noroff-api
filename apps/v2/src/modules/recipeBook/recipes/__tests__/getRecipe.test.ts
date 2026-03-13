import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const RECIPE_UUID = "a229424c-da96-4725-b112-4a880cc7f2e0"

beforeEach(async () => {
  const { name } = await registerUser()

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
      ownerName: name
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

describe("[GET] /recipe-book/recipes/:id", () => {
  it("should return a single recipe", async () => {
    const response = await server.inject({
      url: `/recipe-book/recipes/${RECIPE_UUID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
      id: RECIPE_UUID,
      title: "Spaghetti Carbonara",
      difficulty: "Medium",
      category: "Pasta"
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 for non-existent recipe", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes/00000000-0000-0000-0000-000000000000",
      method: "GET"
    })

    expect(response.statusCode).toBe(404)
  })

  it("should return 400 for invalid UUID", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes/not-a-uuid",
      method: "GET"
    })

    expect(response.statusCode).toBe(400)
  })
})
