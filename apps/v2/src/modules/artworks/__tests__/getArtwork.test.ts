import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const ARTWORK_ID = "5d366279-e68b-4331-a31f-dc1575acd34e"
const NONEXISTENT_ARTWORK_ID = "c14d2ba8-4a94-47dc-9f33-6d32500cf116"
let USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1562785072-c65ab858fcbc?q=80&w=800&fit=crop",
  alt: "A surreal masterpiece"
}

beforeEach(async () => {
  const { name } = await registerUser()

  USER_NAME = name

  // Create test artwork
  await db.artwork.create({
    data: {
      id: ARTWORK_ID,
      title: "The Persistence of Memory",
      artist: "Salvador Dalí",
      year: 1931,
      medium: "Oil on canvas",
      description:
        "A surreal masterpiece famous for its depiction of melting clocks in a dreamlike landscape.",
      location: "Museum of Modern Art, New York",
      image: { create: DEFAULT_IMAGE },
      owner: { connect: { name: USER_NAME } }
    }
  })
})

afterEach(async () => {
  const artworks = db.artwork.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([artworks, users, media])
  await db.$disconnect()
})

describe("[GET] /artworks/:id", () => {
  it("should return single artwork based on id", async () => {
    const response = await server.inject({
      url: `/artworks/${ARTWORK_ID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
      id: ARTWORK_ID,
      title: "The Persistence of Memory",
      artist: "Salvador Dalí",
      year: 1931,
      medium: "Oil on canvas",
      description:
        "A surreal masterpiece famous for its depiction of melting clocks in a dreamlike landscape.",
      location: "Museum of Modern Art, New York",
      image: {
        url: DEFAULT_IMAGE.url,
        alt: DEFAULT_IMAGE.alt
      },
      owner: {
        name: USER_NAME
      }
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if artwork not found", async () => {
    const response = await server.inject({
      url: `/artworks/${NONEXISTENT_ARTWORK_ID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "Artwork not found"
    })
  })

  it("should throw zod error if id is not a valid UUID", async () => {
    const response = await server.inject({
      url: "/artworks/invalid_id",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_string",
      message: "Invalid uuid",
      path: ["id"]
    })
  })
})
