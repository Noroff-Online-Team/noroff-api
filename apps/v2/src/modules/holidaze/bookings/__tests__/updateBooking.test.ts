import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const BOOKING_ID = "3983bfdd-427e-4250-a312-4e765f2998c0"
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { name } = await getAuthCredentials()
  const {
    name: bookingUser,
    bearerToken: bookingBearerToken,
    apiKey: bookingApiKey
  } = await getAuthCredentials({ name: "bidder_user", email: "bidder_user@noroff.no" })

  BEARER_TOKEN = bookingBearerToken
  API_KEY = bookingApiKey

  const VENUE_ID = "2be0af49-2680-4e4d-9423-178346985bbe"

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
  await db.holidazeBooking.create({
    data: {
      id: BOOKING_ID,
      dateFrom: new Date(),
      dateTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      guests: 1,
      venueId: VENUE_ID,
      customerName: bookingUser
    }
  })
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()
  const bookings = db.holidazeBooking.deleteMany()
  const venueMeta = db.holidazeVenueMeta.deleteMany()
  const venueLocation = db.holidazeVenueLocation.deleteMany()
  const venues = db.holidazeVenue.deleteMany()

  await db.$transaction([users, bookings, venueMeta, venueLocation, venues])
  await db.$disconnect()
})

describe("[PUT] /holidaze/bookings/:id", () => {
  it("should return 200 when successfully updated a listing", async () => {
    const initialResponse = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const initialRes = await initialResponse.json()

    expect(initialResponse.statusCode).toEqual(200)
    expect(initialRes.data.guests).toBe(1)

    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        guests: 2
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data.guests).toBe(2)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw zod errors if no data was provided", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {}
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toStrictEqual([
      {
        code: "custom",
        message: "You must provide either dateFrom, dateTo, or guests",
        path: []
      }
    ])
  })

  it("should throw 401 error when attempting to update without API key", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      payload: {
        guests: 2
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

  it("should throw 401 error when attempting to update without Bearer token", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "PUT",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        guests: 2
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
