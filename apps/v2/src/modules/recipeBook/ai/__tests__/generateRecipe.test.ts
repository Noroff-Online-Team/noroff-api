import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { bearerToken, apiKey } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()

  await db.$transaction([users])
  await db.$disconnect()
})

describe("[POST] /recipe-book/ai/generate", () => {
  it("should generate a mock recipe", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/generate",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { prompt: "healthy chicken dinner" }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
      title: expect.stringContaining("healthy chicken dinner"),
      description: expect.any(String),
      prepTime: expect.any(Number),
      cookTime: expect.any(Number),
      servings: expect.any(Number),
      difficulty: expect.any(String),
      category: "AI Generated",
      ingredients: expect.any(Array),
      instructions: expect.any(Array),
      tags: expect.any(Array)
    })
  })

  it("should validate prompt is required", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/generate",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {}
    })

    expect(response.statusCode).toBe(400)
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/generate",
      method: "POST",
      payload: { prompt: "healthy chicken dinner" }
    })

    expect(response.statusCode).toBe(401)
  })
})
