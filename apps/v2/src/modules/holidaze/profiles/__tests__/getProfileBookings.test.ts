import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const BOOKING_ID = "6e8b6e2e-d516-47b5-8966-01ebe7253e85"
let TEST_USER_NAME = ""
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  TEST_USER_NAME = name

  const VENUE_ID = "200d34f0-f878-46e7-8e42-470c6e4eb4a9"
  // Create a venue
  await db.holidazeVenue.create({
    data: {
      id: VENUE_ID,
      name: "Nice hotel",
      description: "A nice hotel",
      price: 100,
      maxGuests: 2,
      meta: { create: {} },
      location: { create: {} },
      owner: { connect: { name } }
    }
  })
  // Create a booking
  await db.holidazeBooking.create({
    data: {
      id: BOOKING_ID,
      dateFrom: new Date(),
      dateTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      guests: 2,
      venueId: VENUE_ID,
      customerName: name
    }
  })
})

afterEach(async () => {
  const media = db.media.deleteMany()
  const apiKey = db.apiKey.deleteMany()
  const users = db.userProfile.deleteMany()

  await db.$transaction([media, apiKey, users])
  await db.$disconnect()
})

describe("[GET] /holidaze/profiles/:id/bookings", () => {
  it("should return bookings belonging to profile", async () => {
    const response = await server.inject({
      url: `/holidaze/profiles/${TEST_USER_NAME}/bookings`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data[0].id).toBe(BOOKING_ID)
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

  it("should return bookings with venue and customer profile", async () => {
    const response = await server.inject({
      url: `/holidaze/profiles/${TEST_USER_NAME}/bookings?_venue=true&_customer=true`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data[0].id).toBe(BOOKING_ID)
    expect(res.data[0].customer).toBeDefined()
    expect(res.data[0].venue).toBeDefined()
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

  it("should throw 404 error when attempting to access bookings for profile that does not exist", async () => {
    const response = await server.inject({
      url: `/holidaze/profiles/does_not_exist/bookings`,
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
      url: `/holidaze/profiles/${TEST_USER_NAME}/bookings`,
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
      url: `/holidaze/profiles/${TEST_USER_NAME}/bookings`,
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
