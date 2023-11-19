import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

beforeEach(async () => {
  const { name } = await registerUser()

  await db.holidazeVenue.create({
    data: {
      name: "Nice hotel",
      description: "A nice hotel",
      price: 100,
      maxGuests: 2,
      meta: { create: {} },
      location: { create: {} },
      owner: { connect: { name } }
    }
  })
  await db.holidazeVenue.create({
    data: {
      name: "Nice place to stay",
      description: "Our venue",
      price: 100,
      maxGuests: 2,
      meta: { create: {} },
      location: { create: {} },
      owner: { connect: { name } }
    }
  })
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const users = db.userProfile.deleteMany()
  const venues = db.holidazeVenue.deleteMany()

  await db.$transaction([media, users, venues])
  await db.$disconnect()
})

describe("[GET] /holidaze/venues/search", () => {
  it("should return venues that contain query in either name or description", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/search?q=venue`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toHaveProperty("name", "Nice place to stay")
  })

  it("should return empty array if no venues match query", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/search?q=random`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(0)
  })

  it("should return venues with pagination and sort", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/search?q=nice&sort=name&sortOrder=asc&limit=1&page=1`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toHaveProperty("name", "Nice hotel")
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
      url: `/holidaze/venues/search`,
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
      url: `/holidaze/venues/search?q=`,
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
