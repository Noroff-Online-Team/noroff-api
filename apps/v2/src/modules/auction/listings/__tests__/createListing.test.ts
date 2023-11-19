import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

import { scheduleCreditsTransfer } from "../listing.utils"

jest.mock("../listing.utils.ts", () => ({
  scheduleCreditsTransfer: jest.fn()
}))

const createData = {
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
  jest.clearAllMocks()
  const { bearerToken, apiKey } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const users = db.userProfile.deleteMany()
  const listings = db.auctionListing.deleteMany()

  await db.$transaction([media, users, listings])
  await db.$disconnect()
})

describe("[POST] /auction/listings", () => {
  it("should return 201 when successfully created a listing", async () => {
    const response = await server.inject({
      url: "/auction/listings",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
        endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2))
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(201)
    expect(res.data).toStrictEqual({
      id: expect.any(String),
      ...createData,
      created: expect.any(String),
      updated: expect.any(String),
      endsAt: expect.any(String),
      _count: {
        bids: 0
      }
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
    expect(scheduleCreditsTransfer).toHaveBeenCalledWith(expect.any(String), expect.any(Date))
  })

  it("should throw zod errors if data is invalid", async () => {
    const response = await server.inject({
      url: "/auction/listings",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        media: [{ url: "not a valid url" }],
        tags: {},
        endsAt: "not a valid date"
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toStrictEqual([
      {
        code: "invalid_type",
        message: "Title is required",
        path: ["title"]
      },
      {
        code: "invalid_type",
        message: "Tags must be an array of strings",
        path: ["tags"]
      },
      {
        code: "invalid_string",
        message: "Image URL must be valid URL",
        path: ["media", 0, "url"]
      }
    ])
  })

  it("should throw 401 error when attempting to create without API key", async () => {
    const response = await server.inject({
      url: "/auction/listings",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        ...createData,
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

  it("should throw 401 error when attempting to create without Bearer token", async () => {
    const response = await server.inject({
      url: "/auction/listings",
      method: "POST",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
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
