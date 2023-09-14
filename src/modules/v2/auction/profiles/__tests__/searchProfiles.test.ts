import { server, registerUser } from "@/test-utils"
import { db } from "@/utils"

beforeEach(async () => {
  await registerUser()
  await registerUser({ name: "test_user_two", email: "test_user_two@noroff.no" })
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, users])
  await db.$disconnect()
})

describe("[GET] /v2/auction/profiles/search", () => {
  it("should return profiles that contain query in either name or bio", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/search?q=two`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toHaveProperty("name", "test_user_two")
  })

  it("should return empty array if no profiles match query", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/search?q=random`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(0)
  })

  it("should return profiles with pagination and sort", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/search?q=user&sort=name&sortOrder=desc&limit=1&page=1`,
      method: "GET"
    })
    const res = await response.json()
    console.dir(res, { depth: null })
    expect(response.statusCode).toEqual(200)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toHaveProperty("name", "test_user_two")
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

  it("should throw zod error if query param is missing", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/search`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_type",
      message: "Query is required",
      path: ["q"]
    })
  })

  it("should throw zod error if query param is empty", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/search?q=`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors[0]).toStrictEqual({
      code: "too_small",
      message: "Query cannot be empty",
      path: ["q"]
    })
  })
})
