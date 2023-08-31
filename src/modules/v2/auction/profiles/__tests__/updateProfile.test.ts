import { server } from "@/tests/server"
import { db } from "@/utils"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"

const updateData = {
  avatar: {
    url: "https://picsum.photos/id/135/800/800",
    alt: ""
  },
  banner: {
    url: "https://picsum.photos/id/888/1500/500",
    alt: ""
  }
}

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

describe("[PUT] /v2/auction/profiles/:id", () => {
  it("should return 200 when successfully updated a profile", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/${TEST_USER_NAME}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.avatar).toStrictEqual({
      url: "https://picsum.photos/id/135/800/800",
      alt: ""
    })
    expect(res.data.banner).toStrictEqual({
      url: "https://picsum.photos/id/888/1500/500",
      alt: ""
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should revert to default avatar and banner when body is empty", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/${TEST_USER_NAME}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {}
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.avatar).toStrictEqual({
      url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=400&w=400",
      alt: "A blurry multi-colored rainbow background"
    })
    expect(res.data.banner).toStrictEqual({
      url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500",
      alt: "A blurry multi-colored rainbow background"
    })
    expect(res.data).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw 404 error when profile does not exist", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/does_not_exist`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
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

  it("should throw 400 error when attempting to update another user's profile", async () => {
    await server.inject({
      url: "/api/v2/auth/register",
      method: "POST",
      payload: { name: "test_user_two", email: "test_user_two@noroff.no", password: "password" }
    })

    const response = await server.inject({
      url: `/api/v2/auction/profiles/test_user_two`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You can't update another user's profile"
    })
  })

  it("should throw 401 error when attempting to access without API key", async () => {
    const response = await server.inject({
      url: `/api/v2/auction/profiles/${TEST_USER_NAME}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        ...updateData
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
      method: "PUT",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
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
