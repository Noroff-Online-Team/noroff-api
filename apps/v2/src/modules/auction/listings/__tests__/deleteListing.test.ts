import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

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
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      sellerName: name
    }
  })
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()
  const listings = db.auctionListing.deleteMany()

  await db.$transaction([users, listings])
  await db.$disconnect()
})

describe("[DELETE] /auction/listings/:id", () => {
  it("should return 204 when successfully deleted a listing", async () => {
    const response = await server.inject({
      url: `/auction/listings/${LISTING_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toEqual(204)
  })

  it("should throw 401 error when attempting to delete without API key", async () => {
    const response = await server.inject({
      url: `/auction/listings/${LISTING_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
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

  it("should throw 401 error when attempting to delete without Bearer token", async () => {
    const response = await server.inject({
      url: `/auction/listings/${LISTING_ID}`,
      method: "DELETE",
      headers: {
        "X-Noroff-API-Key": API_KEY
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
