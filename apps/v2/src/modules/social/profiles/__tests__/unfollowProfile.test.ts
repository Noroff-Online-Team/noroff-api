import { getAuthCredentials, registerUser, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""
let SECOND_USER_NAME = ""

beforeEach(async () => {
  const { name: secondUserName } = await registerUser({ name: "test_user_two", email: "test_user_two@noroff.no" })
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name
  SECOND_USER_NAME = secondUserName
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const apiKey = db.apiKey.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, apiKey, users])
  await db.$disconnect()
})

describe("[PUT] /social/profiles/:id/unfollow", () => {
  it("should return 200 when successfully unfollowed a profile", async () => {
    const followRes = await server.inject({
      url: `/social/profiles/${SECOND_USER_NAME}/follow`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const followJson = await followRes.json()

    expect(followJson.data.following).toHaveLength(1)
    expect(followJson.data.following[0].name).toBe(SECOND_USER_NAME)

    const response = await server.inject({
      url: `/social/profiles/${SECOND_USER_NAME}/unfollow`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.followers).toHaveLength(0)
    expect(res.data.following).toHaveLength(0)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw 400 error when attempting to unfollow yourself", async () => {
    const response = await server.inject({
      url: `/social/profiles/${USER_NAME}/unfollow`,
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
      message: "You can't unfollow yourself"
    })
  })

  it("should throw 400 error when attempting to unfollow a profile you don't follow", async () => {
    const response = await server.inject({
      url: `/social/profiles/${SECOND_USER_NAME}/unfollow`,
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
      message: "You are not following this profile"
    })
  })

  it("should throw 404 error when profile does not exist", async () => {
    const response = await server.inject({
      url: `/social/profiles/does_not_exist/unfollow`,
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
      message: "No profile with this name"
    })
  })

  it("should throw 401 error when attempting to access without API key", async () => {
    const response = await server.inject({
      url: `/social/profiles/${USER_NAME}/unfollow`,
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

  it("should throw 401 error when attempting to access without Bearer token", async () => {
    const response = await server.inject({
      url: `/social/profiles/${USER_NAME}/unfollow`,
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
