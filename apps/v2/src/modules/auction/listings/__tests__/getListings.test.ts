import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const TAG_LISTING_ID = "5231496a-0351-4a2a-a876-c036410e0cbc"
const ACTIVE_LISTING_ID = "c9953c48-0e2d-4d29-8bd9-18e26cc364fc"

beforeEach(async () => {
  const { name } = await registerUser()

  await db.auctionListing.create({
    data: {
      id: TAG_LISTING_ID,
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
      endsAt: new Date(new Date().setMinutes(new Date().getMinutes() - 1)),
      sellerName: name
    }
  })
  await db.auctionListing.create({
    data: {
      id: ACTIVE_LISTING_ID,
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

describe("[GET] /auction/listings", () => {
  it("should return all listings without Bearer and API key", async () => {
    const response = await server.inject({
      url: "/auction/listings",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })

  it("should return all listings with pagination and sort", async () => {
    const response = await server.inject({
      url: "/auction/listings?page=1&limit=1&sort=title&sortOrder=asc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].title).toBe("Blue chair")
    expect(res.meta).toBeDefined()
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

  it("should return all listings that match a tag", async () => {
    const response = await server.inject({
      url: "/auction/listings?_tag=blue",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBe(TAG_LISTING_ID)
    expect(res.data[0].title).toBe("Blue chair")
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

  it("should return all listings that are active", async () => {
    const response = await server.inject({
      url: "/auction/listings?_active=true",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBe(ACTIVE_LISTING_ID)
    expect(res.data[0].title).toBe("Dinner table with 2 chairs")
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

  it("should return all listings with bids", async () => {
    const response = await server.inject({
      url: "/auction/listings?_bids=true",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].bids).toBeDefined()
    expect(res.data[1].bids).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })

  it("should return all listings with seller", async () => {
    const response = await server.inject({
      url: "/auction/listings?_seller=true",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].seller).toBeDefined()
    expect(res.data[1].seller).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })
})
