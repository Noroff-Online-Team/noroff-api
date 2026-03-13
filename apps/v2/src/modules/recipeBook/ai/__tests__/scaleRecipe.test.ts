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

describe("[POST] /recipe-book/ai/scale", () => {
  it("should scale recipe ingredients", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/scale",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ingredients: [
          { name: "Flour", quantity: 200, unit: "g" },
          { name: "Sugar", quantity: 100, unit: "g" }
        ],
        originalServings: 4,
        targetServings: 8
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.originalServings).toBe(4)
    expect(res.data.targetServings).toBe(8)
    expect(res.data.scaleFactor).toBe(2)
    expect(res.data.scaledIngredients).toHaveLength(2)
    expect(res.data.scaledIngredients[0]).toMatchObject({
      name: "Flour",
      originalQuantity: 200,
      scaledQuantity: 400,
      unit: "g"
    })
    expect(res.data.tips).toBeInstanceOf(Array)
  })

  it("should handle scaling down", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/scale",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
        originalServings: 4,
        targetServings: 1
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.scaleFactor).toBe(0.25)
    expect(res.data.scaledIngredients[0].scaledQuantity).toBe(50)
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/recipe-book/ai/scale",
      method: "POST",
      payload: {
        ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
        originalServings: 4,
        targetServings: 8
      }
    })

    expect(response.statusCode).toBe(401)
  })
})
