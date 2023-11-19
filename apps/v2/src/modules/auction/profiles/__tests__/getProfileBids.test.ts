import { getAuthCredentials, registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const LISTING_ID = "db66a67e-3bb4-4286-a0e3-f4380a07c53d"
let TEST_USER_NAME = ""
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  // Register user
  const { bearerToken, apiKey, name } = await getAuthCredentials()
  // Register second user
  const { name: userTwoName } = await registerUser({ name: "test_user_two", email: "test_user_two@noroff.no" })

  TEST_USER_NAME = name
  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  // Create a listing
  await db.auctionListing.create({
    data: {
      id: LISTING_ID,
      title: "Dinner table with 2 chairs",
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      sellerName: userTwoName
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

describe("[GET] /auction/profiles/:id/bids", () => {
  it("should return profile bids based on name", async () => {
    await db.auctionBid.create({
      data: {
        listingId: LISTING_ID,
        amount: 10,
        bidderName: "test_user"
      }
    })

    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/bids`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
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

  it("should throw 404 error when attempting to access profile that does not exist", async () => {
    const response = await server.inject({
      url: `/auction/profiles/does_not_exist/bids`,
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
      url: `/auction/profiles/${TEST_USER_NAME}/bids`,
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
      url: `/auction/profiles/${TEST_USER_NAME}/bids`,
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
