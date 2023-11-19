import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const VENUE_ID = "2be0af49-2680-4e4d-9423-178346985bbe"
let USER_NAME = ""
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
  USER_NAME = name

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
})

afterEach(async () => {
  const users = db.userProfile.deleteMany()
  const venueMeta = db.holidazeVenueMeta.deleteMany()
  const venueLocation = db.holidazeVenueLocation.deleteMany()
  const venues = db.holidazeVenue.deleteMany()

  await db.$transaction([users, venueMeta, venueLocation, venues])
  await db.$disconnect()
})

describe("[DELETE] /holidaze/venues/:id", () => {
  it("should return 204 when successfully deleted a venue", async () => {
    // Make user a venue manager
    await db.userProfile.update({
      where: { name: USER_NAME },
      data: { venueManager: true }
    })

    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toEqual(204)
  })

  it("should throw 404 error if venue does not exist", async () => {
    const response = await server.inject({
      url: "/holidaze/venues/857be398-8c34-4be9-8729-8b46837ac3c5",
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
      message: "Venue not found"
    })
  })

  it("should throw 403 error if user is not a venue manager", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
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

  it("should throw 403 error if venue does not belong to the user", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
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
      message: "You are not the owner of this venue"
    })
  })

  it("should throw 401 error when attempting to delete without API key", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
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
      url: `/holidaze/venues/${VENUE_ID}`,
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
