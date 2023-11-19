import { getAuthCredentials, registerUser, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const USER_TWO_NAME = "test_user_two"
  const USER_THREE_NAME = "test_user_three"

  const { bearerToken, apiKey } = await getAuthCredentials()
  const { name: secondUserName } = await registerUser({ name: USER_TWO_NAME, email: "test_user_two@noroff.no" })
  const { name: thirdUserName } = await registerUser({ name: USER_THREE_NAME, email: "test_user_three@noroff.no" })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  // Create three posts with two different users
  await db.socialPost.createMany({
    data: [
      {
        title: "My post",
        tags: ["tag1"],
        owner: secondUserName
      },
      {
        title: "Another post",
        tags: ["another_tag"],
        owner: secondUserName
      },
      {
        title: "A third post appears",
        tags: ["third_tag"],
        owner: thirdUserName
      }
    ]
  })
  // Only follow user two
  await server.inject({
    url: `/social/profiles/${USER_TWO_NAME}/follow`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "X-Noroff-API-Key": API_KEY
    }
  })
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()
  const posts = db.socialPost.deleteMany()

  await db.$transaction([users, media, posts])
  await db.$disconnect()
})

describe("[GET] /social/posts/following", () => {
  it("should return all posts", async () => {
    const response = await server.inject({
      url: "/social/posts/following",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].media).toBe(null)
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

  it("should return all posts with pagination and sort", async () => {
    const response = await server.inject({
      url: "/social/posts/following?page=1&limit=1&sort=title&sortOrder=asc",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].title).toBe("Another post")
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

  it("should return all posts with author profile, reactions, and comments", async () => {
    const response = await server.inject({
      url: "/social/posts/following?_author=true&_reactions=true&_comments=true",
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].author).toBeDefined()
    expect(res.data[0].reactions).toBeDefined()
    expect(res.data[0].comments).toBeDefined()
    expect(res.data[1].author).toBeDefined()
    expect(res.data[1].reactions).toBeDefined()
    expect(res.data[1].comments).toBeDefined()
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

  it("should return all posts that match a tag", async () => {
    const response = await server.inject({
      url: `/social/posts/following?_tag=tag1`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].tags).toEqual(expect.arrayContaining(["tag1"]))
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

  it("should throw 401 error when attempting to access without API key", async () => {
    const response = await server.inject({
      url: "/social/posts/following",
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
      url: "/social/posts/following",
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
