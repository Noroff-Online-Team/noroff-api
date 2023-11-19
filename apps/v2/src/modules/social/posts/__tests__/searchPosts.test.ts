import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  await db.socialPost.createMany({
    data: [
      {
        title: "My post",
        body: "My awesome post",
        tags: ["tag1"],
        owner: name
      },
      {
        title: "Another post",
        tags: ["another_tag"],
        owner: name
      }
    ]
  })
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const users = db.userProfile.deleteMany()
  const venues = db.holidazeVenue.deleteMany()

  await db.$transaction([media, users, venues])
  await db.$disconnect()
})

describe("[GET] /social/posts/search", () => {
  it("should return posts that contain query in either title or body", async () => {
    const response = await server.inject({
      url: `/social/posts/search?q=awesome`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toHaveProperty("title", "My post")
  })

  it("should return empty array if no posts match query", async () => {
    const response = await server.inject({
      url: `/social/posts/search?q=random`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(0)
  })

  it("should return posts with pagination and sort", async () => {
    const response = await server.inject({
      url: `/social/posts/search?q=post&sort=title&sortOrder=asc&limit=1&page=1`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toHaveProperty("title", "Another post")
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
      url: `/social/posts/search`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
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
      url: `/social/posts/search?q=`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
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
