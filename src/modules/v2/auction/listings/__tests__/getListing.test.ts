import { server } from "@/tests/server"
import { db } from "@/utils"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"

beforeEach(async () => {
  // Register user
  await server.inject({
    url: "/api/v2/auth/register",
    method: "POST",
    payload: { name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })

  // createMany doesn't support creating relations, so instead we create two products separately.
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
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      sellerName: "test_user"
    }
  })
  await db.auctionListing.create({
    data: {
      id: "c9953c48-0e2d-4d29-8bd9-18e26cc364fc",
      title: "Dinner table with 2 chairs",
      description: "Selling a dinner table with 2 chairs",
      media: {
        createMany: {
          data: [
            {
              url: "https://images.unsplash.com/photo-1620395458832-6436796c2d4c?fit=crop&fm=jpg&h=800&w=800",
              alt: "A table with two chairs and a vase with flowers on it"
            },
            {
              url: "https://images.unsplash.com/photo-1605543667606-52b0f1ee1b72?fit=crop&fm=jpg&h=800&w=800",
              alt: "A laptop computer sitting on top of a wooden desk with a chair behind it"
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
  const users = db.userProfile.deleteMany()
  const listings = db.auctionListing.deleteMany()

  await db.$transaction([media, users, listings])
  await db.$disconnect()
})

describe("[GET] /v2/auction/listings/:id", () => {
  it("should return single listing based on id", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBe("5231496a-0351-4a2a-a876-c036410e0cbc")
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

  it("should return single listings with bids", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbc?_bids=true",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.bids).toBeDefined()
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

  it("should return single listing with seller", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbc?_seller=true",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.seller).toBeDefined()
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

  it("should throw 404 if listing doesn't exist", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/5231496a-0351-4a2a-a876-c036410e0cbd",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0].message).toBe("No listing with such ID")
  })

  it("should throw zod error if id is not a uuid", async () => {
    const response = await server.inject({
      url: "/api/v2/auction/listings/invalid_id",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0].message).toBe("ID must be a valid UUID")
  })
})
