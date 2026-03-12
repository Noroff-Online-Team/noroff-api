import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const createData = {
  title: "Spaghetti Carbonara",
  description: "A classic Italian pasta dish with eggs, cheese, and pancetta.",
  prepTime: 10,
  cookTime: 20,
  servings: 4,
  difficulty: "Medium",
  category: "Pasta",
  ingredients: [
    { name: "Spaghetti", quantity: 400, unit: "g" },
    { name: "Pancetta", quantity: 200, unit: "g" },
    { name: "Eggs", quantity: 4, unit: "large" },
    { name: "Parmesan", quantity: 100, unit: "g" }
  ],
  instructions: [
    "Cook spaghetti in salted boiling water.",
    "Fry pancetta until crispy.",
    "Mix eggs and parmesan.",
    "Combine pasta with pancetta, then add egg mixture off heat.",
    "Serve immediately."
  ],
  tags: ["Italian", "Pasta"],
  image: {
    url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800&fit=crop",
    alt: "Spaghetti Carbonara"
  }
}

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name
})

afterEach(async () => {
  const mealPlans = db.mealPlan.deleteMany()
  const favorites = db.recipeFavorite.deleteMany()
  const comments = db.recipeComment.deleteMany()
  const recipes = db.recipe.deleteMany()
  const pantryItems = db.pantryItem.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([
    mealPlans,
    favorites,
    comments,
    recipes,
    pantryItems,
    users,
    media
  ])
  await db.$disconnect()
})

describe("[POST] /recipe-book/recipes", () => {
  it("should return 201 when successfully created a recipe", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: createData
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toMatchObject({
      id: expect.any(String),
      title: "Spaghetti Carbonara",
      description:
        "A classic Italian pasta dish with eggs, cheese, and pancetta.",
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: "Medium",
      category: "Pasta",
      tags: ["Italian", "Pasta"],
      image: {
        url: createData.image.url,
        alt: createData.image.alt
      },
      owner: {
        name: USER_NAME
      },
      comments: []
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should create recipe with minimal required data", async () => {
    const minimalData = {
      title: "Toast",
      description: "Simple toast.",
      prepTime: 1,
      cookTime: 3,
      servings: 1,
      difficulty: "Easy",
      category: "Breakfast",
      ingredients: [{ name: "Bread", quantity: 2, unit: "slices" }],
      instructions: ["Toast the bread."]
    }

    const response = await server.inject({
      url: "/recipe-book/recipes",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: minimalData
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toMatchObject({
      id: expect.any(String),
      title: "Toast",
      tags: [],
      owner: { name: USER_NAME }
    })
  })

  it("should throw zod errors if required data is missing", async () => {
    const { title, ...rest } = createData
    const response = await server.inject({
      url: "/recipe-book/recipes",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: rest
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors.length).toBeGreaterThan(0)
  })

  it("should validate difficulty enum", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
        difficulty: "Extreme"
      }
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes",
      method: "POST",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: createData
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: "/recipe-book/recipes",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: createData
    })

    expect(response.statusCode).toBe(401)
    const res = await response.json()
    expect(res.errors).toBeDefined()
  })
})
