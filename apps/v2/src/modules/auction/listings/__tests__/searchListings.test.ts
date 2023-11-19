import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

beforeEach(async () => {
  const { name } = await registerUser()

  await db.auctionListing.createMany({
    data: [
      {
        title: "Blue chair",
        description: "Selling a blue chair",
        endsAt: new Date(new Date().setMinutes(new Date().getMinutes() + 5)),
        sellerName: name
      },
      {
        title: "Dinner table with 2 chairs",
        description: "Selling a dinner table with 2 chairs",
        endsAt: new Date(new Date().setMonth(new Date().getMinutes() + 5)),
        sellerName: name
      }
    ]
  })
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const users = db.userProfile.deleteMany()
  const listings = db.auctionListing.deleteMany()

  await db.$transaction([media, users, listings])
  await db.$disconnect()
})

describe("[GET] /auction/listings/search", () => {
  it("should return listings that contain query in either title or description", async () => {
    const response = await server.inject({
      url: `/auction/listings/search?q=blue`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toHaveProperty("title", "Blue chair")
  })

  it("should return empty array if no listings match query", async () => {
    const response = await server.inject({
      url: `/auction/listings/search?q=random`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(0)
  })

  it("should return listings with pagination and sort", async () => {
    const response = await server.inject({
      url: `/auction/listings/search?q=chair&sort=title&sortOrder=desc&limit=1&page=1`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toHaveProperty("title", "Dinner table with 2 chairs")
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: false,
      currentPage: 1,
      previousPage: null,
      nextPage: 2,
      pageCount: 2,
      totalCount: 2
    })
  })

  it("should throw zod error if query param is missing", async () => {
    const response = await server.inject({
      url: `/auction/listings/search`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_type",
      message: "Query is required",
      path: ["q"]
    })
  })

  it("should throw zod error if query param is empty", async () => {
    const response = await server.inject({
      url: `/auction/listings/search?q=`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors[0]).toStrictEqual({
      code: "too_small",
      message: "Query cannot be empty",
      path: ["q"]
    })
  })
})
