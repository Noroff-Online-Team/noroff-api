import { server } from "@/tests/server"
import { db } from "@/utils"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"

beforeEach(async () => {
  await server.inject({
    url: "/api/v2/auth/register",
    method: "POST",
    payload: { name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
  })
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const apiKey = db.apiKey.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, apiKey, users])
  await db.$disconnect()
})

describe("[POST] /v2/auth/create-api-key", () => {
  it("should return 201 when creating an API key with correct credentials", async () => {
    const userRes = await server.inject({
      url: "/api/v2/auth/login",
      method: "POST",
      payload: {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      }
    })

    expect(userRes.statusCode).toBe(200)

    const response = await server.inject({
      url: "/api/v2/auth/create-api-key",
      method: "POST",
      headers: {
        Authorization: `Bearer ${userRes.json().data.accessToken}`
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveProperty("key")
    expect(res.data.name).toBe("API Key")
    expect(res.data.status).toBe("ACTIVE")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 401 when creating an API key with incorrect credentials", async () => {
    const response = await server.inject({
      url: "/api/v2/auth/create-api-key",
      method: "POST",
      headers: {}
    })
    const res = await response.json()

    expect(response.statusCode).toBe(401)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toContainEqual({
      message: "No authorization header was found"
    })
    expect(res.status).toBe("Unauthorized")
  })

  it("should use the name if provided in the request body", async () => {
    const userRes = await server.inject({
      url: "/api/v2/auth/login",
      method: "POST",
      payload: {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      }
    })

    expect(userRes.statusCode).toBe(200)

    const response = await server.inject({
      url: "/api/v2/auth/create-api-key",
      method: "POST",
      headers: {
        Authorization: `Bearer ${userRes.json().data.accessToken}`
      },
      payload: {
        name: "My awesome API key"
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveProperty("key")
    expect(res.data.name).toBe("My awesome API key")
    expect(res.data.status).toBe("ACTIVE")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })
})
