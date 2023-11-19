import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const LISTING_ID = "08df6673-401b-4646-b4bb-c364b3c9b007"
let TEST_USER_EMAIL = ""
let TEST_USER_NAME = ""
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { bearerToken, apiKey, name, email } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  TEST_USER_NAME = name
  TEST_USER_EMAIL = email

  await db.auctionListing.create({
    data: {
      id: LISTING_ID,
      title: "Dinner table",
      description: "A table for dinner",
      endsAt: new Date(new Date().setSeconds(new Date().getSeconds() + 1)),
      sellerName: name,
      winnerName: name
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

describe("[GET] /auction/profiles/:name/wins", () => {
  it("should return wins belonging to profile", async () => {
    // Wait for auction to end
    await new Promise(resolve => setTimeout(resolve, 2000))

    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/wins`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toContainEqual(
      expect.objectContaining({
        id: LISTING_ID,
        title: "Dinner table",
        description: "A table for dinner",
        media: expect.arrayContaining([]),
        tags: expect.arrayContaining([]),
        created: expect.any(String),
        updated: expect.any(String),
        endsAt: expect.any(String),
        _count: {
          bids: expect.any(Number)
        }
      })
    )
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

  it("should return wins with bids and seller profile", async () => {
    // Wait for auction to end
    await new Promise(resolve => setTimeout(resolve, 2000))

    const response = await server.inject({
      url: `/auction/profiles/${TEST_USER_NAME}/wins?_bids=true&_seller=true`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toContainEqual(
      expect.objectContaining({
        id: LISTING_ID,
        title: "Dinner table",
        description: "A table for dinner",
        media: expect.arrayContaining([]),
        tags: expect.arrayContaining([]),
        created: expect.any(String),
        updated: expect.any(String),
        endsAt: expect.any(String),
        bids: expect.arrayContaining([]),
        seller: expect.objectContaining({
          name: TEST_USER_NAME,
          email: TEST_USER_EMAIL,
          bio: null,
          avatar: expect.objectContaining({
            url: expect.any(String),
            alt: expect.any(String)
          }),
          banner: expect.objectContaining({
            url: expect.any(String),
            alt: expect.any(String)
          })
        }),
        _count: {
          bids: expect.any(Number)
        }
      })
    )
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
      url: `/auction/profiles/does_not_exist/wins`,
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
      url: `/auction/profiles/${TEST_USER_NAME}/wins`,
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
      url: `/auction/profiles/${TEST_USER_NAME}/wins`,
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
