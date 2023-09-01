import { server, registerUser, getAuthCredentials } from "@/test-utils"
import { db } from "@/utils"

const BIDDER_USER_NAME = "bidder_user"
const BIDDER_USER_EMAIL = "bidder_user@noroff.no"
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  // Register user
  const { name } = await registerUser()
  // Register second user
  const { bearerToken, apiKey } = await getAuthCredentials({ name: BIDDER_USER_NAME, email: BIDDER_USER_EMAIL })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  // Create listing to bid on
  await db.auctionListing.create({
    data: {
      id: "1d685931-37fd-442d-a68d-8f4ca38a1fb4",
      title: "Red chair",
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      sellerName: name
    }
  })
  // Create a listing that has already ended
  await db.auctionListing.create({
    data: {
      id: "f2d2bc7d-d302-4275-98c1-0bac73cf1407",
      title: "Orange chair",
      endsAt: new Date(new Date().setMinutes(new Date().getMinutes() - 1)),
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

  it("should subtract the bid amount from the user's credits", async () => {
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

    const userResponse = await server.inject({
      url: `/api/v2/auction/profiles/${BIDDER_USER_NAME}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const userData = await userResponse.json()

    expect(response.statusCode).toEqual(200)
    expect(userData.data.credits).toEqual(990)
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
