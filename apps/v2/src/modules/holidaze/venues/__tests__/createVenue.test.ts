import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const createData = {
  name: "Test hotel",
  description: "A test hotel",
  price: 100,
  maxGuests: 2,
  meta: { create: {} },
  location: { create: {} },
  owner: { connect: { USER_NAME } }
}

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()
  const venueMeta = db.holidazeVenueMeta.deleteMany()
  const venueLocation = db.holidazeVenueLocation.deleteMany()
  const venues = db.holidazeVenue.deleteMany()

  await db.$transaction([users, venueMeta, venueLocation, venues])
  await db.$disconnect()
})

describe("[POST] /holidaze/venues", () => {
  it("should return 201 when successfully created a venue", async () => {
    // Make user a venue manager
    await db.userProfile.update({
      where: { name: USER_NAME },
      data: { venueManager: true }
    })

    const response = await server.inject({
      url: "/holidaze/venues",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(201)
    expect(res.data).toStrictEqual({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      price: 100,
      maxGuests: 2,
      media: expect.any(Object),
      meta: expect.any(Object),
      location: expect.any(Object),
      rating: expect.any(Number),
      updated: expect.any(String),
      created: expect.any(String),
      _count: expect.objectContaining({
        bookings: expect.any(Number)
      })
    })
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw 403 if user is not a venue manager", async () => {
    const response = await server.inject({
      url: "/holidaze/venues",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You are not a venue manager"
    })
  })

  it("should throw zod errors if data is invalid", async () => {
    const response = await server.inject({
      url: "/holidaze/venues",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
        name: true,
        maxGuests: -1
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toStrictEqual([
      {
        code: "invalid_type",
        message: "Name must be a string",
        path: ["name"]
      },
      {
        code: "too_small",
        message: "A venue must accommodate at least one guest",
        path: ["maxGuests"]
      }
    ])
  })

  it("should throw 401 error when attempting to create without API key", async () => {
    const response = await server.inject({
      url: "/holidaze/venues",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        ...createData
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

  it("should throw 401 error when attempting to create without Bearer token", async () => {
    const response = await server.inject({
      url: "/holidaze/venues",
      method: "POST",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
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
