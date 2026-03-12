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

describe("[POST] /recipe-book/ai/substitutions", () => {
  it("should return substitutions for a known ingredient", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/substitutions",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { ingredient: "butter" }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.ingredient).toBe("butter")
    expect(res.data.substitutions).toBeInstanceOf(Array)
    expect(res.data.substitutions.length).toBeGreaterThan(0)
    expect(res.data.substitutions[0]).toMatchObject({
      name: expect.any(String),
      ratio: expect.any(String),
      notes: expect.any(String)
    })
  })

  it("should return default substitutions for unknown ingredient", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/substitutions",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { ingredient: "unicorn tears" }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.ingredient).toBe("unicorn tears")
    expect(res.data.substitutions).toBeInstanceOf(Array)
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/substitutions",
      method: "POST",
      payload: { ingredient: "butter" }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should validate request body", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/substitutions",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {}
    })

    expect(response.statusCode).toBe(400)
  })
})
