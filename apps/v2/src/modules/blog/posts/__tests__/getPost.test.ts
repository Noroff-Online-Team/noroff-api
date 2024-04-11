import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const POST_ID = "7ebb7a88-0cb5-4a12-8d68-defe899eae54"
let USER_NAME = ""
let BEARER_TOKEN = ""

beforeEach(async () => {
  const { name, bearerToken } = await getAuthCredentials()

  USER_NAME = name
  BEARER_TOKEN = bearerToken

  await db.blogPost.createMany({
    data: {
      id: POST_ID,
      title: "My post",
      body: "This is my post body",
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

describe("[GET] /blog/posts/:name/:id", () => {
  it("should return single post based on id", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/${POST_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toStrictEqual({
      id: POST_ID,
      title: "My post",
      body: expect.any(String),
      tags: [],
      media: null,
      created: expect.any(String),
      updated: expect.any(String),
      author: {
        name: expect.any(String),
        email: expect.any(String),
        bio: null,
        avatar: {
          url: expect.any(String),
          alt: expect.any(String)
        },
        banner: {
          url: expect.any(String),
          alt: expect.any(String)
        }
      }
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if post not found", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}/deec56b3-533e-4bbf-bc0d-4b4bc8af3e30`,
      method: "GET",
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
      message: "No post with such ID"
    })
  })
})
