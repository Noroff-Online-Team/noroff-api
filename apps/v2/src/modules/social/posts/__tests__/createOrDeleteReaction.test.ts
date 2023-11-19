import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const POST_ID = 1
const REACTION_SYMBOL = "👍"
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

  await db.$executeRaw`ALTER SEQUENCE "SocialPost_id_seq" RESTART WITH 1;`
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
  const socialPostReaction = db.socialPostReaction.deleteMany()
  const posts = db.socialPost.deleteMany()

  await db.$transaction([users, media, socialPostReaction, posts])
  await db.$disconnect()
})

describe("[PUT] /social/posts/:id/react/:symbol", () => {
  it("should successfully add a reaction to a post", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/react/${REACTION_SYMBOL}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toStrictEqual({
      postId: POST_ID,
      symbol: REACTION_SYMBOL,
      reactions: expect.arrayContaining([
        expect.objectContaining({
          symbol: REACTION_SYMBOL,
          count: 1
        })
      ])
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should successfully remove a reaction from a post", async () => {
    const reactionResponse = await server.inject({
      url: `/social/posts/${POST_ID}/react/${REACTION_SYMBOL}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const reactRes = await reactionResponse.json()

    expect(reactRes.data).toStrictEqual({
      postId: POST_ID,
      symbol: REACTION_SYMBOL,
      reactions: [
        {
          symbol: REACTION_SYMBOL,
          count: 1
        }
      ]
    })

    const response = await server.inject({
      url: `/social/posts/${POST_ID}/react/${REACTION_SYMBOL}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toStrictEqual({
      postId: POST_ID,
      symbol: REACTION_SYMBOL,
      reactions: []
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw zod error when attempting to react to a post with invalid symbol", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/react/not_a_symbol`,
      method: "PUT",
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
      code: "invalid_string",
      message: "Must be a valid emoji",
      path: ["symbol"]
    })
  })

  it("should throw 404 error when attempting to react to a post that doesn't exist", async () => {
    const response = await server.inject({
      url: `/social/posts/3/react/${REACTION_SYMBOL}`,
      method: "PUT",
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

  it("should throw 401 error when attempting to react without API key", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/react/${REACTION_SYMBOL}`,
      method: "PUT",
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

  it("should throw 401 error when attempting to react without Bearer token", async () => {
    const response = await server.inject({
      url: `/social/posts/${POST_ID}/react/${REACTION_SYMBOL}`,
      method: "PUT",
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
