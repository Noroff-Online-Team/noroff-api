import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

let USER_NAME = ""

const RECIPE_UUIDS = [
  "a229424c-da96-4725-b112-4a880cc7f2e0",
  "a65d389d-694a-4d7e-b6bf-d27229c28848",
  "a6e9956f-f257-4bbf-be3f-c4ea710e68f3"
]

beforeEach(async () => {
  const { name } = await registerUser()
  USER_NAME = name

  await db.recipe.createMany({
    data: [
      {
        id: RECIPE_UUIDS[0],
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
      },
      {
        id: RECIPE_UUIDS[1],
        title: "Caesar Salad",
        description: "Fresh and crispy salad.",
        prepTime: 15,
        cookTime: 0,
        servings: 2,
        difficulty: "Easy",
        category: "Salad",
        ingredients: [{ name: "Romaine lettuce", quantity: 1, unit: "head" }],
        instructions: ["Chop lettuce.", "Add dressing."],
        tags: ["Healthy"],
        ownerName: USER_NAME
      },
      {
        id: RECIPE_UUIDS[2],
        title: "Beef Wellington",
        description: "An impressive main course.",
        prepTime: 45,
        cookTime: 30,
        servings: 6,
        difficulty: "Hard",
        category: "Main Course",
        ingredients: [{ name: "Beef tenderloin", quantity: 1, unit: "kg" }],
        instructions: ["Sear beef.", "Wrap in pastry.", "Bake."],
        tags: ["British"],
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

describe("[GET] /recipe-book/recipes", () => {
  it("should return all recipes", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(3)
    expect(res.data[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      owner: { name: expect.any(String) }
    })
    expect(res.meta).toMatchObject({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      totalCount: 3
    })
  })

  it("should support pagination", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes?limit=2&page=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(2)
    expect(res.meta).toMatchObject({
      isFirstPage: true,
      isLastPage: false,
      currentPage: 1,
      nextPage: 2,
      totalCount: 3
    })
  })

  it("should support sorting by title", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes?sort=title&sortOrder=asc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(3)
    expect(res.data[0].title).toBe("Beef Wellington")
    expect(res.data[1].title).toBe("Caesar Salad")
    expect(res.data[2].title).toBe("Spaghetti Carbonara")
  })

  it("should filter by category", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes?category=Pasta",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0].title).toBe("Spaghetti Carbonara")
  })

  it("should filter by difficulty", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes?difficulty=Easy",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0].title).toBe("Caesar Salad")
  })

  it("should filter by search term", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes?search=salad",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0].title).toBe("Caesar Salad")
  })
})
