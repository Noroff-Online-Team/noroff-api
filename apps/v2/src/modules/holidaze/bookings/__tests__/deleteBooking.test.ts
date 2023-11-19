import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const BOOKING_ID = "857be398-8c34-4be9-8729-8b46837ac3c4"
let BEARER_TOKEN = ""
let API_KEY = ""

let SECOND_BEARER_TOKEN = ""
let SECOND_API_KEY = ""

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()
  const { bearerToken: secondBearerToken, apiKey: secondApiKey } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  SECOND_BEARER_TOKEN = secondBearerToken
  SECOND_API_KEY = secondApiKey

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
        customerName: name
      },
      {
        dateFrom: new Date(),
        dateTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        guests: 2,
        venueId: VENUE_ID,
        customerName: name
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

describe("[DELETE] /holidaze/bookings/:id", () => {
  it("should return 204 when successfully deleted a listing", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toEqual(204)
  })

  it("should throw 404 error when attempting to delete a booking that does not exist", async () => {
    const response = await server.inject({
      url: "/holidaze/bookings/857be398-8c34-4be9-8729-8b46837ac3c5",
      method: "DELETE",
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
      message: "Booking not found"
    })
  })

  it("should throw 403 error when attempting to delete a booking that does not belong to the user", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": SECOND_API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You are not the owner of this booking"
    })
  })

  it("should throw 401 error when attempting to delete without API key", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "DELETE",
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

  it("should throw 401 error when attempting to delete without Bearer token", async () => {
    const response = await server.inject({
      url: `/holidaze/bookings/${BOOKING_ID}`,
      method: "DELETE",
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
