import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const VENUE_ID = "2be0af49-2680-4e4d-9423-178346985bbe"

beforeEach(async () => {
  const { name } = await registerUser()

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

describe("[GET] /holidaze/venues/:id", () => {
  it("should return single venue based on id without Bearer and API Key", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBe(VENUE_ID)
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return single venue with bookings", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}?_bookings=true`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.bookings).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return single venue with owner", async () => {
    const response = await server.inject({
      url: `/holidaze/venues/${VENUE_ID}?_owner=true`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.owner).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })
})
