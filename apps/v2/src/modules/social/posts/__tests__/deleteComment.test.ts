import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const POST_ID = 1
let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

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
  it("should successfully delete a comment", async () => {
    const { id: COMMENT_ID } = await db.socialPostComment.create({
      data: {
        body: "Test comment",
        postId: POST_ID,
        owner: USER_NAME
      }
    })

    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment/${COMMENT_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)

    const comments = await db.socialPostComment.findMany()
    expect(comments).toHaveLength(0)
  })

  it("should successfully delete a comment and its replies", async () => {
    // Create a comment
    const { id: COMMENT_ID } = await db.socialPostComment.create({
      data: {
        body: "Test comment",
        postId: POST_ID,
        owner: USER_NAME
      }
    })

    // Create a reply to the comment
    await db.socialPostComment.create({
      data: {
        body: "Test reply",
        postId: POST_ID,
        owner: USER_NAME,
        replyToId: COMMENT_ID
      }
    })

    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment/${COMMENT_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)

    // Check that the comment and its reply have been deleted
    const comments = await db.socialPostComment.findMany()
    expect(comments).toHaveLength(0)
  })

  it("should only delete replies that are related to the comment", async () => {
    // Create a comment
    await db.socialPostComment.create({
      data: {
        body: "Test comment",
        postId: POST_ID,
        owner: USER_NAME
      }
    })

    // Create a comment that will receive a reply
    const { id: COMMENT_ID } = await db.socialPostComment.create({
      data: {
        body: "Test comment with reply",
        postId: POST_ID,
        owner: USER_NAME
      }
    })

    // Create a reply to the comment that will be deleted
    await db.socialPostComment.create({
      data: {
        body: "Test reply",
        postId: POST_ID,
        owner: USER_NAME,
        replyToId: COMMENT_ID
      }
    })

    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment/${COMMENT_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)

    // Check that the comment and its reply have been deleted
    const comments = await db.socialPostComment.findMany()
    expect(comments).toHaveLength(1)
    expect(comments[0].body).toBe("Test comment")
  })

  it("should throw zod error when attempting to delete a comment with an invalid id", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment/1.2`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
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
      message: "Comment ID must be an integer",
      path: ["commentId"]
    })
  })

  it("should throw 400 when attempting to delete a comment that's not related to the post", async () => {
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
    const { id: COMMENT_ID } = await db.socialPostComment.create({
      data: {
        body: "Test comment",
        postId: SECOND_POST_ID,
        owner: USER_NAME
      }
    })

    // Try to delete the comment on post 2 through post 1
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment/${COMMENT_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
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

  it("should throw 404 when attempting to delete a non-existent comment", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment/1`,
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
      message: "Comment not found"
    })
  })

  it("should throw 404 error when attempting to delete a comment on a non-existent post", async () => {
    const response = await server.inject({
      url: `/social/posts/3/comment/1`,
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

  it("should throw 401 error when attempting to delete without API key", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/comment/1`,
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
      url: `/social/posts/${POST_ID}/comment/1`,
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
