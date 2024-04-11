import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const POST_ID = "6cbd4816-76ae-4776-87dc-7a5ade7ae714"
let USER_NAME = ""
let BEARER_TOKEN = ""
let SECOND_BEARER_TOKEN = ""

const originalData = {
  title: "Test post title"
}
const updateData = {
  title: "Updated post title"
}

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
      ...originalData,
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

describe("[PUT] /blog/posts/:name/:id", () => {
  it("should return 200 when successfully updated a post", async () => {
    const initialResponse = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    })
    const initialRes = await initialResponse.json()

    expect(initialResponse.statusCode).toEqual(200)
    expect(initialRes.data.title).toBe(originalData.title)

    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.title).toBe(updateData.title)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw zod errors if data is invalid", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        body: true
      }
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toStrictEqual([
      {
        code: "invalid_type",
        message: "Body must be a string",
        path: ["body"]
      }
    ])
  })

  it("should throw zod error if attempting to update with an empty title", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        title: ""
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toStrictEqual([
      {
        code: "too_small",
        message: "Title cannot be empty",
        path: ["title"]
      }
    ])
  })

  it("should throw 404 if trying to update a someone elses post", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You do not have permission to update this post"
    })
  })

  it("should throw 401 error when attempting to create without Bearer token", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "PUT",
      headers: {},
      payload: {
        ...updateData
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
