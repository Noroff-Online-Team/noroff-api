import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

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

const LISTING_ID = "5231496a-0351-4a2a-a876-c036410e0cbc"
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  await db.auctionListing.create({
    data: {
      id: LISTING_ID,
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
      sellerName: name
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

describe("[PUT] /auction/listings/:id", () => {
  it("should return 201 when successfully updated a listing", async () => {
    const initialResponse = await server.inject({
      url: `/auction/listings/${LISTING_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const initialRes = await initialResponse.json()

    expect(initialResponse.statusCode).toEqual(200)
    expect(initialRes.data.title).toBe("Blue chair")

    const response = await server.inject({
      url: `/auction/listings/${LISTING_ID}`,
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
      url: `/auction/listings/${LISTING_ID}`,
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
      url: `/auction/listings/${LISTING_ID}`,
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
      url: `/auction/listings/${LISTING_ID}`,
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
