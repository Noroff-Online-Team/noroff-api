import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const createData = {
  title: "The Persistence of Memory",
  artist: "Salvador Dalí",
  year: 1931,
  medium: "Oil on canvas",
  description:
    "A surreal masterpiece famous for its depiction of melting clocks in a dreamlike landscape.",
  location: "Museum of Modern Art, New York",
  image: {
    url: "https://plus.unsplash.com/premium_photo-1713009135211-d4429bbe5597?q=80&w=800&fit=crop",
    alt: "A surreal masterpiece"
  }
}

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name
})

afterEach(async () => {
  const artworks = db.artwork.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([artworks, users, media])
  await db.$disconnect()
})

describe("[POST] /artworks", () => {
  it("should return 201 when successfully created an artwork", async () => {
    const response = await server.inject({
      url: "/artworks",
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

    expect(response.statusCode).toBe(201)
    expect(res.data).toMatchObject({
      id: expect.any(String),
      title: "The Persistence of Memory",
      artist: "Salvador Dalí",
      year: 1931,
      medium: "Oil on canvas",
      description:
        "A surreal masterpiece famous for its depiction of melting clocks in a dreamlike landscape.",
      location: "Museum of Modern Art, New York",
      image: {
        url: createData.image.url,
        alt: createData.image.alt
      },
      owner: {
        name: USER_NAME
      }
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should throw zod errors if required data is missing", async () => {
    const { title, ...rest } = createData
    const response = await server.inject({
      url: "/artworks",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...rest
      }
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors.length).toBeGreaterThan(0)
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Title is required",
      path: ["title"]
    })
  })

  it("should throw zod errors if data types are invalid", async () => {
    const response = await server.inject({
      url: "/artworks",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
        year: "two"
      }
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Year must be a number",
      path: ["year"]
    })
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/artworks",
      method: "POST",
      headers: {
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should require valid API key", async () => {
    const response = await server.inject({
      url: "/artworks",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
        // Missing API key
      },
      payload: {
        ...createData
      }
    })

    expect(response.statusCode).toBe(401)
    const res = await response.json()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No API key header was found"
    })
  })

  it("should validate image URL", async () => {
    const { image, ...rest } = createData
    const response = await server.inject({
      url: "/artworks",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...rest,
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
      message: "Invalid url",
      path: ["image", "url"]
    })
  })
})
