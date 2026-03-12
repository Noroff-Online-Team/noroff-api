import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""
let ITEM_ID = ""

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name

  const item = await db.pantryItem.create({
    data: {
      name: "Flour",
      quantity: 2.5,
      unit: "kg",
      category: "Baking",
      ownerName: USER_NAME
    }
  })
  ITEM_ID = item.id
})

afterEach(async () => {
  const pantryItems = db.pantryItem.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([pantryItems, users])
  await db.$disconnect()
})

describe("[PUT] /recipe-book/pantry/:id", () => {
  it("should update a pantry item", async () => {
    const response = await server.inject({
      url: `/recipe-book/pantry/${ITEM_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { quantity: 5 }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data.quantity).toBe(5)
  })

  it("should return 403 when non-owner tries to update", async () => {
    const { bearerToken: otherToken, apiKey: otherKey } =
      await getAuthCredentials({
        name: "other_user",
        email: "other_user@noroff.no"
      })

    const response = await server.inject({
      url: `/recipe-book/pantry/${ITEM_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${otherToken}`,
        "X-Noroff-API-Key": otherKey
      },
      payload: { quantity: 100 }
    })

    expect(response.statusCode).toBe(403)
  })
})
