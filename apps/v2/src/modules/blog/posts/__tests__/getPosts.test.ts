import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let USER_NAME = ""
let BEARER_TOKEN = ""

beforeEach(async () => {
  const { name, bearerToken } = await getAuthCredentials()
  const { name: secondName } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  USER_NAME = name
  BEARER_TOKEN = bearerToken

  await db.blogPost.createMany({
    data: [
      {
        title: "My post",
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

  // Create a 3rd post from another user.
  // This is to test that the endpoint only returns posts from the authenticated user.
  await db.blogPost.create({
    data: {
      title: "Second user post",
      owner: secondName
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

describe("[GET] /blog/posts/:name", () => {
  it("should return all posts", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
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
      url: `/blog/posts/${USER_NAME}?page=1&limit=1&sort=title&sortOrder=asc`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
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

  it("should return all posts that match a tag", async () => {
    const response = await server.inject({
      url: `/blog/posts/${USER_NAME}?_tag=tag1`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
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
})
