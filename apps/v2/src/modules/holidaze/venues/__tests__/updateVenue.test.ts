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
    name: "another_user",
    email: "another_user@noroff.no"
  })

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name
  SECOND_BEARER_TOKEN = secondBearerToken
  SECOND_API_KEY = secondApiKey

  await db.holidazeVenue.create({
    data: {
      id: VENUE_ID,
      name: "Nice hotel",
      description: "A nice hotel",
      price: 100,
      maxGuests: 4,
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

describe("[PUT] /holidaze/venues/:id", () => {
  it("should return 200 when successfully updated a venue", async () => {
    // Make user a venue manager
    await db.userProfile.update({
      where: { name: USER_NAME },
      data: { venueManager: true }
    })

    const initialResponse = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const initialRes = await initialResponse.json()

    expect(initialResponse.statusCode).toEqual(200)
    expect(initialRes.data.maxGuests).toBe(4)

    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        maxGuests: 2
      }
    })
    const res = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(res.data.maxGuests).toBe(2)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should throw 403 error if user is not a venue manager", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        maxGuests: 2
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
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": SECOND_API_KEY
      },
      payload: {
        maxGuests: 4
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

  it("should throw zod errors if no data was provided", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
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
        message: "You must provide at least one field to update",
        path: []
      }
    ])
  })

  it("should throw 401 error when attempting to update without API key", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
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
      url: `/holidaze/venues/${VENUE_ID}`,
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
