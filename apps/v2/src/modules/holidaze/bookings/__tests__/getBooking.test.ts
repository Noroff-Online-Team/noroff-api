import { getAuthCredentials, registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const BOOKING_ID = "857be398-8c34-4be9-8729-8b46837ac3c4"
let BEARER_TOKEN = ""
let API_KEY = ""

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()
  const { name: bookingUser } = await registerUser({ name: "bidder_user", email: "bidder_user@noroff.no" })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey

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
  await db.holidazeBooking.createMany({
    data: [
      {
        id: BOOKING_ID,
        dateFrom: new Date(),
        dateTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        guests: 1,
        venueId: VENUE_ID,
        customerName: bookingUser
      },
      {
        dateFrom: new Date(),
        dateTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        guests: 2,
        venueId: VENUE_ID,
        customerName: bookingUser
      }
    ]
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

describe("[GET] /holidaze/bookings/:id", () => {
  it("should return single booking based on id", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBe(BOOKING_ID)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return single booking with venue", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}?_venue=true`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.venue).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return single booking with customer", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}?_customer=true`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.customer).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw 401 error when attempting to access without API key", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
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
      url: `/holidaze/bookings/${BOOKING_ID}`,
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
