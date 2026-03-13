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

describe("[DELETE] /recipe-book/pantry/:id", () => {
  it("should delete a pantry item", async () => {
    const response = await server.inject({
      url: `/recipe-book/pantry/${ITEM_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)
  })

  it("should return 404 for non-existent item", async () => {
    const response = await server.inject({
      url: "/recipe-book/pantry/00000000-0000-0000-0000-000000000000",
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(404)
  })
})
