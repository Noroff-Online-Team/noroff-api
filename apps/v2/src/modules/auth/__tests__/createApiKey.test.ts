import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

let TEST_USER_EMAIL = ""
let TEST_USER_PASSWORD = ""

beforeEach(async () => {
  const { email, password } = await registerUser()
  TEST_USER_EMAIL = email
  TEST_USER_PASSWORD = password
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const apiKey = db.apiKey.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, apiKey, users])
  await db.$disconnect()
})

describe("[POST] /auth/create-api-key", () => {
  it("should return 201 when creating an API key with correct credentials", async () => {
    const userRes = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      }
    })

    expect(userRes.statusCode).toBe(200)

    const response = await server.inject({
      url: "/auth/create-api-key",
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
      url: "/auth/create-api-key",
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
  })

  it("should use the name if provided in the request body", async () => {
    const userRes = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      }
    })

    expect(userRes.statusCode).toBe(200)

    const response = await server.inject({
      url: "/auth/create-api-key",
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
