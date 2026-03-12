import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""

const createData = {
  name: "Flour",
  quantity: 2.5,
  unit: "kg",
  category: "Baking"
}

beforeEach(async () => {
  const { bearerToken, apiKey } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
})

afterEach(async () => {
  const pantryItems = db.pantryItem.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([pantryItems, users])
  await db.$disconnect()
})

describe("[POST] /recipe-book/pantry", () => {
  it("should return 201 when successfully created a pantry item", async () => {
    const response = await server.inject({
      url: "/recipe-book/pantry",
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
      name: "Flour",
      quantity: 2.5,
      unit: "kg",
      category: "Baking"
    })
  })

  it("should throw zod errors if required data is missing", async () => {
    const response = await server.inject({
      url: "/recipe-book/pantry",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: { name: "Flour" }
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.errors).toBeDefined()
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/recipe-book/pantry",
      method: "POST",
      payload: createData
    })

    expect(response.statusCode).toBe(401)
  })
})
