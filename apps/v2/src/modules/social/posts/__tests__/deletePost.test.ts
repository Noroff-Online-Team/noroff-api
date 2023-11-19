import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const POST_ID = 1
let BEARER_TOKEN = ""
let API_KEY = ""
let SECOND_BEARER_TOKEN = ""
let SECOND_API_KEY = ""

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()
  const { bearerToken: secondBearerToken, apiKey: secondApiKey } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  SECOND_BEARER_TOKEN = secondBearerToken
  SECOND_API_KEY = secondApiKey

  await db.socialPost.createMany({
    data: [
      {
        id: POST_ID,
        title: "Test post title",
        owner: name
      }
    ]
  })
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()
  const posts = db.socialPost.deleteMany()

  await db.$transaction([users, media, posts])
  await db.$disconnect()
})

describe("[DELETE] /social/posts/:id", () => {
  it("should return 204 when successfully deleted a post", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toEqual(204)
  })

  it("should throw 404 error if post does not exist", async () => {
    const response = await server.inject({
      url: `/social/posts/3`,
      method: "DELETE",
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
      message: "Post not found"
    })
  })

  it("should throw 403 error if user is not the owner of the post", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": SECOND_API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You do not have permission to delete this post"
    })
  })

  it("should throw 401 error when attempting to delete without API key", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}`,
      method: "DELETE",
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

  it("should throw 401 error when attempting to delete without Bearer token", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}`,
      method: "DELETE",
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
