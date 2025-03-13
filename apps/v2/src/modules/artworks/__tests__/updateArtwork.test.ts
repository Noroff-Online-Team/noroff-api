import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const ARTWORK_ID = "39b3d7a7-eae9-4fc0-a34f-3a466c9078d9"
let BEARER_TOKEN = ""
let SECOND_BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1562785072-c65ab858fcbc?q=80&w=800&fit=crop",
  alt: "A surreal masterpiece"
}

const originalData = {
  title: "The Persistence of Memory",
  artist: "Salvador Dalí",
  year: 1931,
  medium: "Oil on canvas"
}

const updateData = {
  title: "Starry Night",
  artist: "Vincent van Gogh",
  year: 1889,
  medium: "Oil on canvas"
}

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()
  const { bearerToken: secondBearerToken } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  USER_NAME = name
  BEARER_TOKEN = bearerToken
  SECOND_BEARER_TOKEN = secondBearerToken
  API_KEY = apiKey

  await db.artwork.create({
    data: {
      id: ARTWORK_ID,
      ...originalData,
      description: "A friendly dog who loves playing fetch",
      location: "Oslo Animal Shelter",
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

describe("[PUT] /artworks/:id", () => {
  it("should return 200 when successfully updated an artwork", async () => {
    const response = await server.inject({
      url: `/artworks/${ARTWORK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
      id: ARTWORK_ID,
      title: "Starry Night",
      artist: "Vincent van Gogh",
      year: 1889,
      medium: "Oil on canvas",
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

  it("should return 404 if artwork does not exist", async () => {
    const response = await server.inject({
      url: "/artworks/a9f8e5d4-3c2b-1f0e-9d8c-7b6a5e4d3c2b",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
      }
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

  it("should throw 403 if trying to update someone else's artwork", async () => {
    const response = await server.inject({
      url: `/artworks/${ARTWORK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You are not the owner of this artwork"
    })
  })

  it("should throw validation error if update data is invalid", async () => {
    const response = await server.inject({
      url: `/artworks/${ARTWORK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        medium: true
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toStrictEqual([
      {
        code: "invalid_type",
        message: "Medium must be a string",
        path: ["medium"]
      }
    ])
  })

  it("should throw error if no fields are provided to update", async () => {
    const response = await server.inject({
      url: `/artworks/${ARTWORK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {}
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toStrictEqual([
      {
        code: "custom",
        message: "You must provide at least one field to update",
        path: []
      }
    ])
  })

  it("should validate image URL when updating", async () => {
    const response = await server.inject({
      url: `/artworks/${ARTWORK_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        image: {
          url: "invalid-url",
          alt: "Invalid URL test"
        }
      }
    })

    expect(response.statusCode).toBe(400)
    const res = await response.json()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_string",
      message: "Image URL must be valid URL",
      path: ["image", "url"]
    })
  })
})
