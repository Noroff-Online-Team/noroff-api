import { server } from "@/tests/server"
import { db } from "@/utils"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"

const updateData = {
  title: "Blue chair",
  description: "Selling a blue chair",
  media: [
    {
      url: "https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?fit=crop&w=1974&q=80",
      alt: "A white table with a blue chair and a clock on the wall"
    }
  ],
  tags: ["chair", "blue", "furniture"]
}

let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  // Register user
  await server.inject({
    url: "/api/v2/auth/register",
    method: "POST",
    payload: { name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })

  // Login user
  const user = await server.inject({
    url: "/api/v2/auth/login",
    method: "POST",
    payload: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })
  const bearerToken = user.json().data.accessToken

  // Create API key
  const apiKey = await server.inject({
    url: "/api/v2/auth/create-api-key",
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey.json().data.key

  await db.auctionListing.create({
    data: {
      id: "5231496a-0351-4a2a-a876-c036410e0cbc",
      title: "Blue chair",
      description: "Selling a blue chair",
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?fit=crop&w=1974&q=80",
            alt: "A white table with a blue chair and a clock on the wall"
          }
        ]
      },
      tags: ["chair", "blue", "furniture"],
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      sellerName: "test_user"
    }
  })
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const users = db.userProfile.deleteMany()
  const listings = db.auctionListing.deleteMany()

  await db.$transaction([media, users, listings])
  await db.$disconnect()
})

describe("[PUT] /v2/auction/listings/:id", () => {
  it("should return 201 when successfully updated a listing", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbc",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData,
        title: "Updated title",
        endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2))
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toStrictEqual({
      id: expect.any(String),
      ...updateData,
      title: "Updated title",
      created: expect.any(String),
      updated: expect.any(String),
      endsAt: expect.any(String),
      _count: {
        bids: 0
      }
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw zod errors if no data was provided", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbc",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {}
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toStrictEqual([
      {
        code: "custom",
        message: "You must provide either title, description, media, or tags",
        path: []
      }
    ])
  })

  it("should throw 401 error when attempting to update without API key", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbc",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        ...updateData,
        endsAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(401)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No API key header was found"
    })
  })

  it("should throw 401 error when attempting to update without Bearer token", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbc",
      method: "PUT",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData,
        endsAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(401)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No authorization header was found"
    })
  })
})
