import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let USER_NAME = ""
let SECOND_USER_NAME = ""
let BEARER_TOKEN = ""

const createData = {
  title: "Test post title",
  body: "Test post body"
}

beforeEach(async () => {
  const { name, bearerToken } = await getAuthCredentials()
  const { name: secondName } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  USER_NAME = name
  SECOND_USER_NAME = secondName
  BEARER_TOKEN = bearerToken
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()
  const posts = db.blogPost.deleteMany()

  await db.$transaction([users, media, posts])
  await db.$disconnect()
})

describe("[POST] /blog/posts/:name", () => {
  it("should return 201 when successfully created a post", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        ...createData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.title).toBe("Test post title")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw zod errors if data is invalid", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}`,
      method: "POST",
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
        message: "Title is required",
        path: ["title"]
      },
      {
        code: "invalid_type",
        message: "Body must be a string",
        path: ["body"]
      }
    ])
  })

  it("should throw 401 error when attempting to create for another user", async () => {
    const response = await server.inject({
      url: `/blog/posts/${SECOND_USER_NAME}`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        ...createData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You do not have permission to create a post for another user"
    })
  })

  it("should throw 401 error when attempting to create without Bearer token", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}`,
      method: "POST",
      headers: {},
      payload: {
        ...createData
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
