import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const LISTING_ID = "c040dce9-585b-4cfa-99a8-29533f4a3382"
let TEST_USER_NAME = ""
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  TEST_USER_NAME = name

  await db.auctionListing.create({
    data: {
      id: LISTING_ID,
      title: "Dinner table with 2 chairs",
      description: "Selling a dinner table with 2 chairs",
      media: {
        createMany: {
          data: [
            {
              url: "https://images.unsplash.com/photo-1620395458832-6436796c2d4c?fit=crop&fm=jpg&h=800&w=800",
              alt: "A table with two chairs and a vase with flowers on it"
            }
          ]
        }
      },
      tags: ["table", "chair", "furniture"],
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      sellerName: "test_user"
    }
  })
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const apiKey = db.apiKey.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, apiKey, users])
  await db.$disconnect()
})

describe("[GET] /auction/profiles/:id/listings", () => {
  it("should return listings belonging to profile", async () => {
    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/listings`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data[0].id).toBe(LISTING_ID)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 1
    })
  })

  it("should return listings with bids and seller profile", async () => {
    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/listings?_bids=true&_seller=true`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data[0].id).toBe(LISTING_ID)
    expect(res.data[0].seller).toBeDefined()
    expect(res.data[0].bids).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 1
    })
  })

  it("should return listings matching tag", async () => {
    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/listings?tag=table`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data[0].id).toBe(LISTING_ID)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 1
    })
  })

  it("should return empty array when no listings match tag", async () => {
    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/listings?_tag=invalid_tag`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(0)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 0,
      totalCount: 0
    })
  })

  it("should throw 404 error when attempting to access profile that does not exist", async () => {
    const response = await server.inject({
      url: `/auction/profiles/does_not_exist/listings`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No profile with this name"
    })
  })

  it("should throw 401 error when attempting to access without API key", async () => {
    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/listings`,
      method: "GET",
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

  it("should throw 401 error when attempting to access without Bearer token", async () => {
    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/listings`,
      method: "GET",
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
