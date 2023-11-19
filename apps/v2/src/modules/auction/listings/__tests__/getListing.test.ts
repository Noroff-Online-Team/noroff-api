import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const LISTING_ID = "5231496a-0351-4a2a-a876-c036410e0cbc"

beforeEach(async () => {
  // Register user
  const { name } = await registerUser()

  // Create listing
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
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2)),
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

describe("[GET] /auction/listings/:id", () => {
  it("should return single listing based on id", async () => {
    const response = await server.inject({
      url: `/auction/listings/${LISTING_ID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBe(LISTING_ID)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return single listings with bids", async () => {
    const response = await server.inject({
      url: `/auction/listings/${LISTING_ID}?_bids=true`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.bids).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return single listing with seller", async () => {
    const response = await server.inject({
      url: `/auction/listings/${LISTING_ID}?_seller=true`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.seller).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw 404 if listing doesn't exist", async () => {
    const response = await server.inject({
      url: "/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbd",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No listing with such ID"
    })
  })

  it("should throw zod error if id is not a uuid", async () => {
    const response = await server.inject({
      url: "/auction/listings/invalid_id",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_string",
      message: "ID must be a valid UUID",
      path: ["id"]
    })
  })
})
