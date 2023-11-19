import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

let TEST_USER_NAME = ""
let TEST_USER_EMAIL = ""
let TEST_USER_PASSWORD = ""

beforeEach(async () => {
  const { name, email, password } = await registerUser()
  TEST_USER_NAME = name
  TEST_USER_EMAIL = email
  TEST_USER_PASSWORD = password
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, users])
  await db.$disconnect()
})

describe("[POST] /auth/login", () => {
  it("should return 200 when logging in with correct credentials", async () => {
    const response = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      }
    })

    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveProperty("avatar")
    expect(res.data).toHaveProperty("banner")
    expect(res.data).toHaveProperty("accessToken")
    expect(res.data.name).toBe(TEST_USER_NAME)
    expect(res.data.email).toBe(TEST_USER_EMAIL)
    expect(res.data.bio).toBe(null)
    expect(res.data).not.toHaveProperty(TEST_USER_PASSWORD)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw 401 error when logging in with incorrect credentials", async () => {
    const response = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: {
        email: "invalid_email@noroff.no",
        password: "invalid_password"
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(401)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toContainEqual({
      message: "Invalid email or password"
    })
  })

  it("should throw zod error if email is not a string", async () => {
    const response = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: {
        email: true,
        password: TEST_USER_PASSWORD
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Email must be a string",
      path: ["email"]
    })
  })

  it("should throw zod error if password is not a string", async () => {
    const response = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: {
        email: TEST_USER_EMAIL,
        password: 123
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Password must be a string",
      path: ["password"]
    })
  })

  it("should throw zod error if email is missing", async () => {
    const response = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: {
        password: TEST_USER_PASSWORD
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Email is required",
      path: ["email"]
    })
  })

  it("should throw zod error if password is missing", async () => {
    const response = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: {
        email: TEST_USER_EMAIL
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Password is required",
      path: ["password"]
    })
  })

  it("should throw zod error if payload is missing", async () => {
    const response = await server.inject({
      url: "/auth/login",
      method: "POST"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Expected object, received null",
      path: []
    })
  })
})
