import { server } from "@/tests/server"
import { db } from "@/utils"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"

let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  // Register users
  await server.inject({
    url: "/api/v2/auth/register",
    method: "POST",
    payload: { name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })

  // Login user
  const user = await server.inject({
    url: "/api/v2/auth/login",
    method: "POST",
    payload: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })
  const bearerToken = user.json().data.accessToken

  // Create API key
  const apiKey = await server.inject({
    url: "/api/v2/auth/create-api-key",
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey.json().data.key
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const apiKey = db.apiKey.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, apiKey, users])
  await db.$disconnect()
})

describe("[GET] /v2/auction/profiles/:id", () => {
  it("should return single profile based on name", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/${TEST_USER_NAME}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.name).toBe("test_user")
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

  it("should return single profile with sort", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/${TEST_USER_NAME}?sort=name&sortOrder=asc`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.name).toBe("test_user")
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

  it("should return single profile with listings", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/${TEST_USER_NAME}?_listings=true`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.name).toBe("test_user")
    expect(res.data.listings).toBeDefined()
    expect(res.data.listings).toHaveLength(0)
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

  it("should throw 404 error when attempting to access profile that does not exist", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/does_not_exist`,
      method: "GET",
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
      message: "No profile with this name"
    })
  })

  it("should throw 401 error when attempting to access without API key", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/${TEST_USER_NAME}`,
      method: "GET",
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

  it("should throw 401 error when attempting to access without Bearer token", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/${TEST_USER_NAME}`,
      method: "GET",
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
