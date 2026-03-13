import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name

  await db.pantryItem.createMany({
    data: [
      {
        name: "Flour",
        quantity: 2.5,
        unit: "kg",
        category: "Baking",
        ownerName: USER_NAME
      },
      {
        name: "Sugar",
        quantity: 1,
        unit: "kg",
        category: "Baking",
        ownerName: USER_NAME
      },
      {
        name: "Milk",
        quantity: 2,
        unit: "liters",
        category: "Dairy",
        ownerName: USER_NAME
      }
    ]
  })
})

afterEach(async () => {
  const pantryItems = db.pantryItem.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([pantryItems, users])
  await db.$disconnect()
})

describe("[GET] /recipe-book/pantry", () => {
  it("should return user's pantry items", async () => {
    const response = await server.inject({
      url: "/recipe-book/pantry",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(3)
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/recipe-book/pantry",
      method: "GET"
    })

    expect(response.statusCode).toBe(401)
  })
})
