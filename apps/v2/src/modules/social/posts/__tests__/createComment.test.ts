import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const POST_ID = 1
let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const createData = {
  body: "Test comment"
}

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name

  await db.socialPost.create({
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
  const socialPostComment = db.socialPostComment.deleteMany()
  const posts = db.socialPost.deleteMany()

  await db.$transaction([users, media, socialPostComment, posts])
  await db.$disconnect()
})

describe("[POST] /social/posts/:id/comment", () => {
  it("should successfully add a comment to a post", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toBeDefined()
    expect(res.data).toStrictEqual({
      id: expect.any(Number),
      replyToId: null,
      body: createData.body,
      postId: POST_ID,
      owner: USER_NAME,
      created: expect.any(String)
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should successfully add a reply to a comment", async () => {
    const commentResponse = await server.inject({
      url: `/social/posts/${POST_ID}/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
      }
    })
    const commentRes = await commentResponse.json()
    const { id: COMMENT_ID } = commentRes.data

    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
        replyToId: COMMENT_ID
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toBeDefined()
    expect(res.data).toStrictEqual({
      id: expect.any(Number),
      replyToId: COMMENT_ID,
      body: createData.body,
      postId: POST_ID,
      owner: USER_NAME,
      created: expect.any(String)
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw zod error when attempting to add a comment with invalid body", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        title: true
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_type",
      message: "Body is required",
      path: ["body"]
    })
  })

  it("should throw 400 when attempting to reply to a comment that's not related to the post", async () => {
    // Create another post with id 2
    const SECOND_POST_ID = 2
    await db.socialPost.create({
      data: {
        id: SECOND_POST_ID,
        title: "Test post title",
        owner: USER_NAME
      }
    })

    // Create a comment on post 2
    const commentResponse = await server.inject({
      url: `/social/posts/${SECOND_POST_ID}/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
      }
    })
    const commentRes = await commentResponse.json()
    const { id: COMMENT_ID } = commentRes.data

    // Try to reply to the comment on post 2 through post 1
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
        replyToId: COMMENT_ID
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "Comment is not related to this post"
    })
  })

  it("should throw 404 when attempting to reply to a non-existent comment", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
        replyToId: 1
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You can't reply to a comment that does not exist"
    })
  })

  it("should throw 404 error when attempting to add a comment to a non-existent post", async () => {
    const response = await server.inject({
      url: `/social/posts/3/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
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

  it("should throw 401 error when attempting to react without API key", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
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
      message: "No API key header was found"
    })
  })

  it("should throw 401 error when attempting to react without Bearer token", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment`,
      method: "POST",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
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
