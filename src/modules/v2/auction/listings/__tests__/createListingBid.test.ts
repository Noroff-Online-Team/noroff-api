import { server } from "@/tests/server"
import { db } from "@/utils"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"
const BIDDER_USER_NAME = "bidder_user"
const BIDDER_USER_EMAIL = "bidder_user@noroff.no"
const BIDDER_USER_PASSWORD = "password"

let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  // Register user
  await server.inject({
    url: "/api/v2/auth/register",
    method: "POST",
    payload: { name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })

  // Register bidder user
  await server.inject({
    url: "/api/v2/auth/register",
    method: "POST",
    payload: { name: BIDDER_USER_NAME, email: BIDDER_USER_EMAIL, password: BIDDER_USER_PASSWORD }
  })

  // Login bidder user
  const bidderUser = await server.inject({
    url: "/api/v2/auth/login",
    method: "POST",
    payload: { email: BIDDER_USER_EMAIL, password: BIDDER_USER_PASSWORD }
  })
  const bidderBearerToken = bidderUser.json().data.accessToken

  // Create bidder API key
  const apiKey = await server.inject({
    url: "/api/v2/auth/create-api-key",
    method: "POST",
    headers: {
      Authorization: `Bearer ${bidderBearerToken}`
    }
  })

  BEARER_TOKEN = bidderBearerToken
  API_KEY = apiKey.json().data.key

  // Create listing to bid on
  await db.auctionListing.create({
    data: {
      id: "1d685931-37fd-442d-a68d-8f4ca38a1fb4",
      title: "Red chair",
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      sellerName: "test_user"
    }
  })
  // Create a listing that has already ended
  await db.auctionListing.create({
    data: {
      id: "f2d2bc7d-d302-4275-98c1-0bac73cf1407",
      title: "Orange chair",
      endsAt: new Date(new Date().setMinutes(new Date().getMinutes() - 1)),
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

describe("[POST] /v2/auction/listings/:id/bids", () => {
  it("should return status code 201 when successfully created a bid", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/1d685931-37fd-442d-a68d-8f4ca38a1fb4/bids",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        amount: 10
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveProperty("id")
  })

  it("should return status code 400 when trying to bid on a listing that has already ended", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/f2d2bc7d-d302-4275-98c1-0bac73cf1407/bids",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        amount: 10
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors[0]).toStrictEqual({
      message: "This listing has already ended"
    })
  })
})
