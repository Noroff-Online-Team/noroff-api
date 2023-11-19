import { server } from "@/test-utils"

import { db } from "@/utils"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"

afterEach(async () => {
  const media = db.media.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, users])
  await db.$disconnect()
})

describe("[POST] /auth/register", () => {
  it("should register a user successfully and return user details", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveProperty("name")
    expect(res.data.name).toBe(TEST_USER_NAME)
    expect(res.data.email).toBe(TEST_USER_EMAIL)
    expect(res.data.avatar).toStrictEqual({
      url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=400&w=400",
      alt: "A blurry multi-colored rainbow background"
    })
    expect(res.data.banner).toStrictEqual({
      url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500",
      alt: "A blurry multi-colored rainbow background"
    })
    expect(res.data.bio).toBe(null)
    expect(res.data).not.toHaveProperty(TEST_USER_PASSWORD)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should register a user successfully with custom avatar, banner and bio", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        bio: "This is a test bio",
        avatar: {
          url: "https://picsum.photos/id/135/800/800",
          alt: ""
        },
        banner: {
          url: "https://picsum.photos/id/888/1500/500",
          alt: ""
        }
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(201)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveProperty("name")
    expect(res.data.name).toBe(TEST_USER_NAME)
    expect(res.data.email).toBe(TEST_USER_EMAIL)
    expect(res.data.avatar).toStrictEqual({
      url: "https://picsum.photos/id/135/800/800",
      alt: ""
    })
    expect(res.data.banner).toStrictEqual({
      url: "https://picsum.photos/id/888/1500/500",
      alt: ""
    })
    expect(res.data.bio).toBe("This is a test bio")
    expect(res.data).not.toHaveProperty(TEST_USER_PASSWORD)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw 409 error if user already exists", async () => {
    await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: { name: TEST_USER_NAME, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
    })
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors[0]).toStrictEqual({
      message: "Profile already exists"
    })
  })

  it("should throw zod error if name is missing", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        email: TEST_USER_EMAIL,
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
      message: "Name is required",
      path: ["name"]
    })
  })

  it("should throw zod error if name is not a string", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: 123,
        email: TEST_USER_EMAIL,
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
      message: "Name must be a string",
      path: ["name"]
    })
  })

  it("should throw zod error if email is missing", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: TEST_USER_NAME,
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

  it("should throw zod error if email is not a string", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: TEST_USER_NAME,
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

  it("should throw zod error if password is missing", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: TEST_USER_NAME,
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

  it("should throw zod error if password is not a string", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        password: null
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

  it("should throw zod error if avatar is not a valid image url", async () => {
    const response = await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: {
        name: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        avatar: {
          url: "invalid-url"
        }
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toContainEqual({
      code: "invalid_string",
      message: "Image URL must be valid URL",
      path: ["avatar", "url"]
    })
  })
})
