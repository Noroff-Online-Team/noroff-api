import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

let BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const createData = {
  name: "Rex",
  species: "Dog",
  breed: "German Shepherd",
  age: 2,
  gender: "Male",
  size: "Large",
  color: "Black and Tan",
  description: "A loyal and intelligent dog",
  adoptionStatus: "Available",
  location: "Trondheim Pet Shelter",
  image: {
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&fit=crop",
    alt: "A German Shepherd dog"
  }
}

beforeEach(async () => {
  const { bearerToken, apiKey, name } = await getAuthCredentials()

  BEARER_TOKEN = bearerToken
  API_KEY = apiKey
  USER_NAME = name
})

afterEach(async () => {
  const pets = db.pet.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([pets, users, media])
  await db.$disconnect()
})

describe("[POST] /pets", () => {
  it("should return 201 when successfully created a pet", async () => {
    const response = await server.inject({
      url: "/pets",
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
      name: "Rex",
      species: "Dog",
      breed: "German Shepherd",
      age: 2,
      gender: "Male",
      size: "Large",
      color: "Black and Tan",
      description: "A loyal and intelligent dog",
      adoptionStatus: "Available",
      location: "Trondheim Pet Shelter",
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
    const response = await server.inject({
      url: "/pets",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        name: "Rex"
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
      message: "Species is required",
      path: ["species"]
    })
  })

  it("should throw zod errors if data types are invalid", async () => {
    const response = await server.inject({
      url: "/pets",
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...createData,
        age: "two"
      }
    })

    const res = await response.json()
    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual({
      code: "invalid_type",
      message: "Age must be a number",
      path: ["age"]
    })
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: "/pets",
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
      url: "/pets",
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
      url: "/pets",
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
