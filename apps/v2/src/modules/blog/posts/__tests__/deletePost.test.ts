import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const POST_ID = "0a1a7130-6c6f-4dfd-9bde-46094b5ff401"
let USER_NAME = ""
let BEARER_TOKEN = ""
let SECOND_BEARER_TOKEN = ""

beforeEach(async () => {
  const { name, bearerToken } = await getAuthCredentials()
  const { bearerToken: secondBearerToken } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  USER_NAME = name
  BEARER_TOKEN = bearerToken
  SECOND_BEARER_TOKEN = secondBearerToken

  await db.blogPost.create({
    data: {
      id: POST_ID,
      title: "Test post title",
      owner: name
    }
  })
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()
  const posts = db.blogPost.deleteMany()

  await db.$transaction([users, media, posts])
  await db.$disconnect()
})

describe("[DELETE] /blog/posts/:name/:id", () => {
  it("should return 204 when successfully deleted a post", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    })

    expect(response.statusCode).toEqual(204)
  })

  it("should throw 404 error if post does not exist", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/c2ce1dc3-76e0-49d6-8a82-d52ddd39980f`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
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

  it("should throw 404 if trying to delete someone elses post", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`
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

  it("should throw 401 error when attempting to delete without Bearer token", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "DELETE",
      headers: {}
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
